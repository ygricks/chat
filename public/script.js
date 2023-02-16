function uuidv4() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(
        /[018]/g,
        c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

function template(template_name) {
    let template = document.querySelectorAll(`[name="${template_name}"]`);
    if(!template.length) {
        console.error(`can't find template [name="${template_name}"]`);
        return;
    }
    let _html = template[0].innerHTML;
    let template_function = function(data) {
        let html = _html;
        let keys = Object.keys(data);
        for(let key of keys) {
            var re = new RegExp(`{${key}}`, "g");
            html = html.replace(re, data[key]);
        }
        return html;
    };
    return template_function;
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
    const message = input.value;

    const tempId = uuidv4();

    const mess = renderMess({ id:tempId, mess: message, me:'me' });
    history.innerHTML = history.innerHTML + mess;
    const element = document.querySelectorAll(`[data-id="${tempId}"]`)[0];

    fetch(`/api/room/${roomId}`, {
        method: 'POST', // or 'PUT'
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({message, author}),
    })
    .then((response) => response.json())
    .then((response) => {
        element.setAttribute('data-id', response.id);
        element.scrollIntoView();
        input.value = '';
    })
    .catch((error) => {
        element.remove();
        input.value = message;
        console.error('Error:', error);
    });
}

function registerAuthor() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    author = urlParams.get('author') || 'bot';
    console.log({author})
}

let input;
let roomId;
let renderMess;
let history;
let author;

async function start() {
    roomId = parseInt(window.location.pathname.split('/').pop());
    if(roomId < 1) {
        throw new Error(`Invalid roomId: ${roomId}`);
    }
    registerAuthor();
    renderMess = template('messTemplate');
    history = document.getElementsByClassName('chat-history')[0];
    input = document.getElementsByClassName('chat-input')[0];

    const messages = await getMessages(roomId);
    messages.map((mess, key) => {
        messages[key] = renderMess({id:mess.id, mess: mess.mess, me:mess.author===author?'me':''});
    });
    const splitMess = messages.join('');
    history.innerHTML = history.innerHTML + splitMess;

    document.addEventListener('keyup',(e)=>{
        if(e.key === 'Enter' && e.target === input && input.value.length) {
            postMessage();
        }
    });
    const sendButton = document.getElementsByClassName('chat-send')[0];
    document.addEventListener('click', (e) => {
        if(e.target === sendButton && input.value.length) {
            postMessage();
        }
    })
};

document.addEventListener('DOMContentLoaded', start);
