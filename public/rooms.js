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
        ListenCreateRoom();
    }
});

const ListenCreateRoom = function() {
    const button = document.getElementById('createRoom');
    if(!button) {
        console.warn('listen ellement not found');
        return ;
    }
    button.addEventListener('click', async () => {
        const title = await prompt('write title for new room:');
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
    });
}
