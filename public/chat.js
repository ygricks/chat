document.addEventListener('DOMContentLoaded', ()=>{
    const chat = new Chat();
    chat.start();
});

class Chat {
    constructor() {
        let problem = [];

        this.roomId = parseInt(window.location.pathname.split('/').pop());
        if (this.roomId < 1) {
            problem.push(`room id problem "${roomId}"`)
        }
        this.history = document.getElementById('chat-history');
        this.input = document.getElementById('chat-input');
        this.sendButton = document.getElementById('chat-send');
    
        if(!this.input || !this.history) {
            problem.push('chat dom elements problem');
        }

        if(problem.length){
            throw new Error(`Error: ${problem.join(' && ')}`);
        }
        this.lastMessage = 0;
    }

    async start() {
        const messages = await getMessages(this.roomId);
        if(messages.length) {
            this.lastMessage = await populateHistory(this.history, messages);
        }
        this.listenSend();
        this.listenSSE();
    }

    listenSend() {
        document.addEventListener('keyup', (e) => {
            if (e.key === 'Enter' && e.target === this.input && this.input.value.length) {
                this.write();
            }
        });
        this.sendButton.addEventListener('click', (e) => {
            if (this.input.value.length) {
                this.write();
            }
        });
    }

    async write() {
        const message = this.input.value;
        if(message[0] === '/') {
            switch (message) {
                case '/invite':
                    this.inviteScript();
                    return ;
                case '/exit':
                case '/quit':
                    window.location.href = '';
                    return ;
            }
        }
        this.postMessage(message);
    }

    inviteScript() {
        const chatInput = this.input;
        const bg = document.createElement('div');
        bg.setAttribute('id', 'blockModal');
        document.body.appendChild(bg);
        const modal = document.createElement('div');
        modal.setAttribute('id', 'modal')
        bg.appendChild(modal);

        const close = document.createElement('div');
        close.setAttribute('id', 'closeModal');
        close.appendChild(document.createTextNode('⊠'));
        const closeModal = ()=>{bg.remove()};
        close.addEventListener('click', closeModal);
        const keyUpFn = (event) => {
            if(event.code === 'Escape') {
                document.body.removeEventListener('keyup', keyUpFn);
                closeModal();
                chatInput.focus();
            }
        };
        document.body.addEventListener('keyup', keyUpFn);
        modal.appendChild(close);

        

        const list = document.createElement('div');
        list.classList.add('user_list');
        modal.appendChild(list);

        const input = document.createElement('input');
        modal.appendChild(input);
        
        for(let i=0; i<3; i++) {
            const item = document.createElement('div');
            item.appendChild(document.createTextNode(`>> ${i}`));
            list.appendChild(item);
        }

        input.focus();
    }

    clearInput() {
        this.input.value = '';
    }

    async postMessage(message) { 
        fetch(`/api/room/${this.roomId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message })
        })
        .then((response) => {
            this.clearInput();
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }

    async listenSSE() {
        let retryCount = 0;
        let retryDelay = 1e3;
        const self = this;
        const connect = async () => {
            const evtSource = new EventSource(`/stream/${self.roomId}`);
            evtSource.onmessage =  (e) => {
                self.updateMessages.bind(self)(e);
            };
            evtSource.onerror = () => {
                evtSource.close();
                retryCount++;
                if(retryCount < 15) {
                    if(retryCount === 5) {
                        retryDelay = 1e4;
                    } else if (retryCount === 10) {
                        retryDelay = 6e4;
                    }
        
                    setTimeout(()=>{
                        connect();
                    }, retryDelay);
                } else {
                    console.error(new Error(`Can't reconect to sse stream`));
                }
            }
        };
        connect();
    }

    async updateMessages(event){
        const updates = await getRoomUpdates(this.roomId, this.lastMessage);
        if(updates.length) {
            this.lastMessage = await populateHistory(this.history, updates);
        }
    }
}


async function populateHistory (history, messages) {
    let lastMessage;
    let lastMessageElement;

    if(!lastMessage && messages[0].id) {
        lastMessage = messages[0].id;
    }
    for (const message of messages) {
        const id = parseInt(message.id)
        if (id > lastMessage) {
            lastMessage = id;
        }
        const messElement = coverMessage(message);
        history.appendChild(messElement);
        lastMessageElement = messElement;
    }
    lastMessageElement.scrollIntoView();
    return Promise.resolve(lastMessage);
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
    const min = dt.getMinutes();
    span.textContent = dt.getHours() + ':' + (min < 10 ? '0' + min : min);
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
    return Promise.resolve(data);
}

async function getRoomUpdates(roomId, lastMessage) {
    const path = `/api/room/${roomId}/${lastMessage}`;
    const response = await fetch(path);
    if (!response.ok) {
        const message = `An error has occured: ${response.status}`;
        throw new Error(message);
    }
    const data = await response.json();
    return Promise.resolve(data);
}
