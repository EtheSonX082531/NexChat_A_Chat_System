const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
const path = require('path');

const port = 5000;
const app = express();
const server = http.createServer(app);
const io = new Server(server);

const os = require('os');
app.use(express.static('public'));

// Track connected users: socketId → { fullName, initials, hue, roomId }
const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log(`[+] Connected: ${socket.id}`);

  // User announces themselves after entering their name
  socket.on('user-join', (data) => {
    const roomId = data.roomId || 'Global Room';
    socket.join(roomId);

    connectedUsers.set(socket.id, {
      fullName: data.fullName,
      initials: data.initials,
      hue: data.hue,
      roomId: roomId
    });
    console.log(`[JOIN] ${data.fullName} (${socket.id}) to Room: ${roomId}`);

    // Send the current online list for this room to the newly connected client
    const userList = Array.from(connectedUsers.entries())
      .filter(([id, user]) => user.roomId === roomId)
      .map(([socketId, user]) => ({
        socketId,
        ...user
      }));
    socket.emit('online-users', userList);

    // Broadcast to everyone in the room that someone joined
    io.to(roomId).emit('user-joined', {
      socketId: socket.id,
      fullName: data.fullName,
      initials: data.initials,
      hue: data.hue,
      roomId: roomId
    });
  });

  // Chat message
  socket.on('chat-data', (data) => {
    const user = connectedUsers.get(socket.id);
    if (user) {
      console.log(`[MSG] [Room: ${user.roomId}] ${data.fullName}: ${data.message}`);
      io.to(user.roomId).emit('chat-data', data); // Broadcast to all in room
    }
  });

  // Explicit leave
  socket.on('user-leave', () => {
    handleLeave(socket);
  });

  // Connection dropped
  socket.on('disconnect', () => {
    console.log(`[-] Disconnected: ${socket.id}`);
    handleLeave(socket);
  });
});

function handleLeave(socket) {
  if (connectedUsers.has(socket.id)) {
    const user = connectedUsers.get(socket.id);
    console.log(`[LEAVE] ${user.fullName} (${socket.id}) from Room: ${user.roomId}`);
    connectedUsers.delete(socket.id);
    io.to(user.roomId).emit('user-left', { socketId: socket.id });
    socket.leave(user.roomId);
  }
}



function getLocalIP() {
  const interfaces = os.networkInterfaces();

  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }

  return 'localhost';
}

server.listen(port, '0.0.0.0', () => {
  const localIP = getLocalIP();

  console.log(`NexChat server running → http://localhost:${port}`);
  console.log(`Access from same Wi-Fi → http://${localIP}:${port}`);
});