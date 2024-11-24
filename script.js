const socket = io();

// Ask the user for their nickname
let nickname = prompt('Enter your nickname:') || 'Anonymous';
socket.emit('set nickname', nickname);

// Select elements
const messageInput = document.getElementById('message');
const sendButton = document.getElementById('send-btn');
const chatBox = document.getElementById('chat-box');
const themeToggle = document.getElementById('theme-toggle');

// Send message to server
sendButton.addEventListener('click', () => {
    const messageText = messageInput.value.trim();
    if (messageText) {
        const timestamp = new Date().toLocaleTimeString();
        socket.emit('chat message', { text: messageText, nickname, timestamp });
        messageInput.value = ''; // Clear input field
    }
});

// Display incoming messages
socket.on('chat message', (data) => {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.innerHTML = `<strong>${data.nickname}:</strong> ${data.text} <span style="font-size: 0.8em; color: gray;">[${data.timestamp}]</span>`;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight; // Scroll to bottom
});

// Show typing indicator
let typing = false;
let timeout;

messageInput.addEventListener('input', () => {
    if (!typing) {
        typing = true;
        socket.emit('typing', nickname);
    }
    clearTimeout(timeout);
    timeout = setTimeout(() => {
        typing = false;
        socket.emit('stop typing');
    }, 1000);
});

socket.on('typing', (nickname) => {
    const typingElement = document.getElementById('typing-indicator');
    if (!typingElement) {
        const indicator = document.createElement('div');
        indicator.id = 'typing-indicator';
        indicator.textContent = `${nickname} is typing...`;
        chatBox.appendChild(indicator);
    }
});

socket.on('stop typing', () => {
    const typingElement = document.getElementById('typing-indicator');
    if (typingElement) {
        typingElement.remove();
    }
});

// Display online users
socket.on('users', (userList) => {
    const usersDiv = document.getElementById('users');
    usersDiv.innerHTML = '<h3>Online Users:</h3>';
    userList.forEach((user) => {
        const userElement = document.createElement('div');
        userElement.textContent = user;
        usersDiv.appendChild(userElement);
    });
});

// Toggle theme
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
});
