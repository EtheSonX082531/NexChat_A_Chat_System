/* ============================================================
   NexChat — Client Script
   Socket.io + UI logic
   ============================================================ */

const socket = io();

// ─── State ───────────────────────────────────────────────────
let myFullName = '';
let myInitials = '';
let myHue = 0;
let myRoomId = 'Global Room';
const onlineUsers = new Map(); // socketId → { fullName, initials, hue }
let hueCounter = 0;
const hueMax = 8;

// ─── DOM refs ────────────────────────────────────────────────
const joinScreen = document.getElementById('join-screen');
const chatScreen = document.getElementById('chat-screen');

const firstNameInput = document.getElementById('first-name-input');
const lastNameInput = document.getElementById('last-name-input');
const roomIdInput = document.getElementById('room-id-input');
const joinBtn = document.getElementById('join-btn');
const joinError = document.getElementById('join-error');

const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const messagesList = document.getElementById('messages-list');
const messagesContainer = document.getElementById('messages-container');

const onlineList = document.getElementById('online-list');
const onlineCount = document.getElementById('online-count');

const myAvatarHeader = document.getElementById('my-avatar-header');
const myNameHeader = document.getElementById('my-name-header');

const sidebar = document.getElementById('sidebar');
const sidebarRoomName = document.getElementById('sidebar-room-name');
const headerRoomName = document.getElementById('header-room-name');
const headerRoomSubtitle = document.getElementById('header-room-subtitle');
const menuToggle = document.getElementById('menu-toggle');
const leaveBtn = document.getElementById('leave-btn');

// ─── Helpers ─────────────────────────────────────────────────
function getInitials(fullName) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getTimestamp() {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function makeAvatar(initials, hue, sizeClass = 'avatar-lg') {
  const el = document.createElement('div');
  el.className = `avatar ${sizeClass}`;
  el.dataset.hue = hue;
  el.textContent = initials;
  return el;
}

function nextHue() {
  const h = hueCounter % hueMax;
  hueCounter++;
  return h;
}

function scrollToBottom(smooth = true) {
  messagesContainer.scrollTo({
    top: messagesContainer.scrollHeight,
    behavior: smooth ? 'smooth' : 'instant'
  });
}

// ─── Sidebar overlay (mobile) ────────────────────────────────
let overlay = document.createElement('div');
overlay.className = 'sidebar-overlay';
chatScreen.appendChild(overlay);

function openSidebar() {
  sidebar.classList.add('open');
  overlay.classList.add('active');
}
function closeSidebar() {
  sidebar.classList.remove('open');
  overlay.classList.remove('active');
}

menuToggle.addEventListener('click', () => {
  sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
});
overlay.addEventListener('click', closeSidebar);

// ─── Join logic ───────────────────────────────────────────────
function validateAndJoin() {
  const first = firstNameInput.value.trim();
  const last = lastNameInput.value.trim();
  const room = roomIdInput.value.trim() || 'Global Room';

  if (!first) {
    showError('Please enter your first name.');
    firstNameInput.focus();
    return;
  }

  myFullName = last ? `${first} ${last}` : first;
  myInitials = getInitials(myFullName);
  myHue = nextHue();
  myRoomId = room;

  clearError();
  enterChat();
}

function showError(msg) {
  joinError.textContent = msg;
}
function clearError() {
  joinError.textContent = '';
}

joinBtn.addEventListener('click', validateAndJoin);

[firstNameInput, lastNameInput, roomIdInput].forEach(el => {
  if (el) {
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter') validateAndJoin();
    });
  }
});

// ─── Enter chat ───────────────────────────────────────────────
function enterChat() {
  // Update header profile
  myAvatarHeader.textContent = myInitials;
  myAvatarHeader.dataset.hue = myHue;
  myNameHeader.textContent = myFullName;

  // Update room labels
  sidebarRoomName.textContent = myRoomId;
  headerRoomName.textContent = myRoomId;
  if (myRoomId === 'Global Room') {
    headerRoomSubtitle.textContent = 'Everyone can see your messages';
  } else {
    headerRoomSubtitle.textContent = 'Private group chat';
  }

  // Switch screens
  joinScreen.classList.remove('active');
  chatScreen.classList.add('active');

  // Focus message input
  setTimeout(() => messageInput.focus(), 350);

  // Tell server we joined
  socket.emit('user-join', {
    fullName: myFullName,
    initials: myInitials,
    hue: myHue,
    roomId: myRoomId
  });
}

// ─── Leave logic ─────────────────────────────────────────────
leaveBtn.addEventListener('click', () => {
  socket.emit('user-leave');
  chatScreen.classList.remove('active');
  joinScreen.classList.add('active');
  myFullName = '';
  myInitials = '';
  myRoomId = 'Global Room';
  clearMessages();
  firstNameInput.value = '';
  lastNameInput.value = '';
  roomIdInput.value = '';
  firstNameInput.focus();
});

function clearMessages() {
  messagesList.innerHTML = `
    <div class="welcome-msg">
      <div class="welcome-icon">👋</div>
      <p>Welcome to NexChat! Say hello to everyone.</p>
    </div>`;
}

// ─── Send message ─────────────────────────────────────────────
function sendMessage() {
  const text = messageInput.value.trim();
  if (!text || !myFullName) return;

  socket.emit('chat-data', {
    fullName: myFullName,
    initials: myInitials,
    hue: myHue,
    message: text,
    time: getTimestamp()
  });

  messageInput.value = '';
  messageInput.focus();
}

sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// ─── Render message ───────────────────────────────────────────
function renderMessage(data, isMine) {
  // Remove welcome message if present
  const welcome = messagesList.querySelector('.welcome-msg');
  if (welcome) welcome.remove();

  const group = document.createElement('div');
  group.className = `msg-group ${isMine ? 'mine' : 'theirs'}`;

  // Sender row (avatar + name + time)
  const senderRow = document.createElement('div');
  senderRow.className = 'msg-sender-row';

  const avatar = makeAvatar(data.initials, data.hue, 'avatar-lg');
  const nameEl = document.createElement('span');
  nameEl.className = 'msg-sender-name';
  nameEl.textContent = data.fullName;

  const timeEl = document.createElement('span');
  timeEl.className = 'msg-time';
  timeEl.textContent = data.time;

  senderRow.appendChild(avatar);
  senderRow.appendChild(nameEl);
  senderRow.appendChild(timeEl);

  // Bubble
  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';
  bubble.textContent = data.message;

  group.appendChild(senderRow);
  group.appendChild(bubble);

  messagesList.appendChild(group);
  scrollToBottom();
}

// ─── Render system message ────────────────────────────────────
function renderSystemMessage(text) {
  const el = document.createElement('div');
  el.className = 'msg-system';
  el.innerHTML = `<span>${text}</span>`;
  messagesList.appendChild(el);
  scrollToBottom();
}

// ─── Update online list ───────────────────────────────────────
function updateOnlineList() {
  onlineList.innerHTML = '';
  onlineCount.textContent = onlineUsers.size;

  onlineUsers.forEach((user, id) => {
    const item = document.createElement('div');
    item.className = 'online-user';

    const av = makeAvatar(user.initials, user.hue, 'avatar-sm');
    const nameEl = document.createElement('span');
    nameEl.className = 'user-name';
    nameEl.textContent = user.fullName;

    item.appendChild(av);
    item.appendChild(nameEl);

    if (user.fullName === myFullName) {
      const badge = document.createElement('span');
      badge.className = 'you-badge';
      badge.textContent = 'You';
      item.appendChild(badge);
    }

    onlineList.appendChild(item);
  });
}

// ─── Socket events ────────────────────────────────────────────
// Incoming chat message
socket.on('chat-data', (data) => {
  const isMine = (data.fullName === myFullName && myFullName !== '');
  // Only render if we're in the chat
  if (chatScreen.classList.contains('active')) {
    renderMessage(data, isMine);
  }
});

// Someone joined
socket.on('user-joined', (data) => {
  onlineUsers.set(data.socketId, {
    fullName: data.fullName,
    initials: data.initials,
    hue: data.hue
  });
  updateOnlineList();
  if (chatScreen.classList.contains('active')) {
    renderSystemMessage(`${data.fullName} joined the room`);
  }
});

// Someone left
socket.on('user-left', (data) => {
  const user = onlineUsers.get(data.socketId);
  onlineUsers.delete(data.socketId);
  updateOnlineList();
  if (user && chatScreen.classList.contains('active')) {
    renderSystemMessage(`${user.fullName} left the room`);
  }
});

// Full online list on connect/reconnect
socket.on('online-users', (users) => {
  onlineUsers.clear();
  users.forEach(u => {
    onlineUsers.set(u.socketId, {
      fullName: u.fullName,
      initials: u.initials,
      hue: u.hue
    });
  });
  updateOnlineList();
});

// Disconnection
socket.on('disconnect', () => {
  renderSystemMessage('Disconnected from server…');
});
socket.on('connect', () => {
  if (myFullName) {
    socket.emit('user-join', {
      fullName: myFullName,
      initials: myInitials,
      hue: myHue,
      roomId: myRoomId
    });
  }
});