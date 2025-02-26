let connectedUsers = ['User1', 'User2', 'User3'];

// Update the user list
function updateUserList() {
    const userList = document.getElementById('user-list');
    userList.innerHTML = '';

    connectedUsers.forEach(user => {
        const li = document.createElement('li');
        li.textContent = user;
        userList.appendChild(li);
    });
}

// Initialize WebSocket for live chat
let chatSocket = new WebSocket('wss://' + window.location.host + '/ws/chat/'); // Use the correct WebSocket URL

chatSocket.onopen = function() {
    console.log("WebSocket connection established.");
};

chatSocket.onmessage = function(e) {
    const data = JSON.parse(e.data);
    const user = data.user;
    const message = data.message;
    displayMessage(user, message);
};

chatSocket.onerror = function(e) {
    console.error("WebSocket Error: ", e);
};

chatSocket.onclose = function() {
    console.log("WebSocket connection closed.");
};

// Send message function
function sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    
    if (message !== '') {
        chatSocket.send(JSON.stringify({
            'user': 'You',
            'message': message
        }));
        displayMessage('You', message);
        input.value = '';
    }
}

// Display message in chat container
function displayMessage(user, message) {
    const chatContainer = document.getElementById('chat-container');
    
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('chat-message');
    messageDiv.innerHTML = `<strong>${user}: </strong>${message}`;
    
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Handle URL hash changes for chat visibility
window.addEventListener('hashchange', function () {
    const currentHash = window.location.hash;

    if (currentHash === '#live-chat') {
        document.getElementById('chat').style.display = 'block';
        document.getElementById('menu-container').style.display = 'none';
        updateUserList();
    } else {
        document.getElementById('chat').style.display = 'none';
        document.getElementById('menu-container').style.display = 'block';
    }
});
