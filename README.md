# Adda - A Real-Time Chat System

Adda is a modern, real-time chat application built with Node.js, Express, and Socket.IO. It provides a sleek, responsive interface allowing users to connect and chat instantly across various devices. It supports both private and shared chat rooms using unique room codes.

## ✨ Features
- **Real-Time Messaging**: Lightning-fast communication powered by Socket.IO.
- **Private & Public Rooms**: Create a private room or share your room code to chat with multiple friends.
- **Fully Responsive Design**: Optimized layouts for Desktop, Tablet (iPad), and Mobile (Android/iOS).
- **Modern UI/UX**: Glassmorphism elements, custom animations, and distinct user colors for an immersive experience.
- **Simple Setup**: No database required, just run the server and start chatting!

---

## 🚀 How to Run Locally

Follow these simple steps to download and run the project on your local system:

### 1. Download or Clone the Repository
Download the project ZIP file from the GitHub repository and extract it, or clone it using git:
```bash
git clone <your-github-repo-url>
cd "Adda - A Chat System"
```

### 2. Install Dependencies
Make sure you have [Node.js](https://nodejs.org/) installed on your computer. Open your terminal in the project folder and run:
```bash
npm install
```

### 3. Start the Server
Start the backend Node.js server by running:
```bash
node index.js
```

### 4. Open the App
Open your web browser and navigate to:
```text
http://localhost:3000
```
*(If you wish to test with multiple devices on your local network, find your computer's IP address and visit `http://<your-ip-address>:3000` from your phone or tablet).*

---

## 📸 Screenshots & Overview

Here is a glimpse of how the application looks and functions across different scenarios:

### 1. Join Dashboard
![Join Dashboard](Screen%20Shorts/join%20dashboard.png)
*The landing page. Users simply enter their desired display name and a Room Code. If the room doesn't exist, it is created automatically.*

### 2. Private 1-on-1 Chat
![Private Chat](Screen%20Shorts/Chatting%201%20v%201%20in%20privately.png)
*A seamless, real-time private conversation between two users sharing the same room code.*

### 3. Group Chat Room
![Group Chat](Screen%20Shorts/Multiple%20people%20chatting%20in%20a%20private%20room%20and%20also%20the%20room%20can%20be%20used%20as%20public%20by%20sharing%20room%20code..png)
*Multiple people can join the same room. You can treat it as a private group chat or a public forum by sharing the room code with your community.*

### 4. Tablet Experience (iPad)
![Tablet View](Screen%20Shorts/Chatting%20using%20Ipad.png)
*The interface adapts perfectly to larger touch screens like iPads, providing a comfortable typing and reading experience.*

### 5. Mobile Experience (Android)
![Mobile View](Screen%20Shorts/Chatting%20using%20android%20phone.png)
*The mobile layout is highly optimized, ensuring the chat feels like a native mobile application with accessible input fields and smooth scrolling.*

---

## 🛠️ Technologies Used
- **Frontend**: HTML5, CSS3 (Custom animations & styling), Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **WebSockets**: Socket.IO for real-time bidirectional event-based communication
