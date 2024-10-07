const action = function (button) {
    const doSpan = function(title, text) {
        const span = document.createElement('span');
        span.setAttribute('title', title);
        span.textContent = String(text);
        return span;
    };

    let span;
    switch (button) {
        case 'quit':
            span = doSpan(button, '⊝');
            break;
        case 'remove':
            span = doSpan(button, '⊗')
            break;
        case 'create':
            span = doSpan(button, '⊕ create new room');
            break;
        default:
            throw new Error('wrong button type');
    }
    span.classList.add('action');
    span.classList.add(String('action_'+button));
    return span;
}

async function getRooms() {
    const response = await fetch(`/api/rooms`);
    if (!response.ok) {
        const message = `An error has occured: ${response.status}`;
        throw new Error(message);
    }
    return response.json();
}

function coverRoom(room) {
    const li = document.createElement('li');
    li.dataset.id = room.room_id;
    const a = document.createElement('a');
    const span = action(room.author ? 'remove' : 'quit');
    a.href = `/room/${room.room_id}`;
    a.textContent = String(room.title)
    li.appendChild(a);
    li.appendChild(span);

    const lines = ''.padEnd(30, "  -");

    const lineNode = document.createTextNode(' ' + lines.substring(room.title.length) + ' ');
    li.insertBefore(lineNode, span);
    return li;
}

async function start() {
    const roomsElement = document.getElementById('rooms_list');
    const rooms = await getRooms();
    for (const room of rooms) {
        const roomElement = coverRoom(room);
        roomsElement.appendChild(roomElement);
    }
    const newRoom = action('create');
    newRoom.setAttribute('id', 'createRoom');
    roomsElement.appendChild(newRoom);
}

document.addEventListener('DOMContentLoaded', async ()=>{
    const path = window.location.pathname.split('/').pop();
    if (path === '') {
        await start();
        ListenActions();
    }
});

const ListenActions = function() {
    const buttons = document.querySelectorAll('span.action');

    buttons.forEach(btn => btn.addEventListener('click', event => {
        const action = Array.from(event.target.classList).pop();
        switch (action) {
            case 'action_create':
                CreateRoom();
                break;
            case 'action_remove':
                RemoveRoom(event);
                break;
            case 'action_quit':
                QuitRoom(event);
                break;
        
            default:
                console.log('-- nope --', action)
                break;
        }

    }));
}

const CreateRoom = async function() {
    const title = await prompt('write title for new room:');

    if(title.length < 3) {
        console.warn('wrong title');
        return ;
    }

    fetch(`/api/room`, {
        method: 'POST', // or 'PUT'
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({title})
    })
    .then((response) => response.json())
    .then((response) => {
        if (response.seatId) {
            window.location.href = `/room/${response.roomId}`;
        } else {
            console.warn('something went wrong!');
        }
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

const QuitRoom = function(event) {
    if(!confirm('do you really want to quit from that room ?')) {
        return ;
    }

    const parent = event.target.parentNode
    const roomId = parent.getAttribute("data-id");
    fetch(`/api/room/seat/${roomId}`, {
        method: 'DELETE'
    })
    .then((response) => response.json())
    .then((response) => {
        if (response.removed) {
            event.target.parentNode.remove();
        } else {
            console.warn('something went wrong!');
        }
    })
    .catch((error) => {
        console.error('Error:', error);
    });
};

const RemoveRoom = function(event) {
    if(!confirm('do you really want to remove that room ?')) {
        return ;
    }
    const parent = event.target.parentNode
    const roomId = parent.getAttribute("data-id");
    if(!roomId) {
        throw new Error(`Can't get related room`);
    }
    fetch('/api/room/' + roomId,  {
        method: 'DELETE'
    })
    .then((response) => response.json())
    .then(response => {
        if(response.removed) {
            parent.remove();
        } else {
            console.warn('Something goes wrong.');
        }
    });
}
