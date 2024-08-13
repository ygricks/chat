function uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
        (
            c ^
            (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
        ).toString(16)
    );
}

function coverMessage(message) {
    const div = document.createElement('div');
    const classes = ['mess'];
    if (message.author === true) {
        classes.push('me');
    }
    div.classList.add(...classes);
    div.dataset.id = message.id;
    div.textContent = message.mess;
    const span = document.createElement('span');
    const dt = new Date(message.created_at);
    span.textContent = dt.getHours() + ':' + dt.getMinutes();
    div.appendChild(span);
    return div;
}

async function getMessages(roomId) {
    const path = `/api/room/${roomId}`;
    const response = await fetch(path);
    if (!response.ok) {
        const message = `An error has occured: ${response.status}`;
        throw new Error(message);
    }
    const data = await response.json();
    return data;
}

async function postMessage() {
    const tempId = uuidv4();
    const message = input.value;
    const messElement = coverMessage({
        id: tempId,
        mess: message,
        author: true
    });
    history.appendChild(messElement);
    fetch(`/api/room/${roomId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message })
    })
        .then((response) => response.json())
        .then((response) => {
            messElement.dataset.id = response.id;
            messElement.scrollIntoView();
            input.value = '';
        })
        .catch((error) => {
            messElement.remove();
            input.value = message;
            console.error('Error:', error);
        });
}

let input;
let roomId;
let history;

async function start() {
    roomId = parseInt(window.location.pathname.split('/').pop());
    if (roomId < 1) {
        throw new Error(`Invalid roomId: ${roomId}`);
    }
    history = document.getElementsByClassName('chat-history')[0];
    input = document.getElementsByClassName('chat-input')[0];

    const messages = await getMessages(roomId);
    let lastMessage;
    for (const message of messages) {
        const messElement = coverMessage(message);
        history.appendChild(messElement);
        lastMessage = messElement;
    }
    lastMessage.scrollIntoView();

    document.addEventListener('keyup', (e) => {
        if (e.key === 'Enter' && e.target === input && input.value.length) {
            postMessage();
        }
    });
    const sendButton = document.getElementsByClassName('chat-send')[0];
    document.addEventListener('click', (e) => {
        if (e.target === sendButton && input.value.length) {
            postMessage();
        }
    });
}

document.addEventListener('DOMContentLoaded', start);
