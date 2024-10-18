document.addEventListener('DOMContentLoaded', ()=>{
    const chat = new Chat();
    chat.start();
});

class Modal {
    bg=undefined;
    modal=undefined;
    onClose = ()=>{};
    constructor(content) {
        this.bg = document.createElement('div');
        this.bg.setAttribute('id', 'blockModal');
        document.body.appendChild(this.bg);
        this.modal = document.createElement('div');
        this.modal.setAttribute('id', 'modal')
        this.bg.appendChild(this.modal);
        modal.appendChild(content);

        const close = document.createElement('div');
        close.setAttribute('id', 'closeModal');
        close.appendChild(document.createTextNode('⊠'));
        close.addEventListener('click', this.close.bind(this));
        const keyUpFn = (event) => {
            if(event.code === 'Escape') {
                document.body.removeEventListener('keyup', keyUpFn);
                this.close();
            }
        };
        document.body.addEventListener('keyup', keyUpFn);
        this.modal.appendChild(close);
    }
    close() {
        this.onClose();
        this.bg.remove()
    }
}

class Chat {
    modal = undefined;
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
        const self = this;
        const content = document.createElement('div');
        content.setAttribute('id', 'inviteModal');

        self.modal = new Modal(content);
        self.modal.onClose = () => {
            self.input.focus();
        }

        const list = document.createElement('div');
        list.classList.add('user_list');
        content.appendChild(list);

        const input = document.createElement('input');
        content.appendChild(input);

        input.addEventListener('change', () => {
            if(input.value.length >= 3) {
                fetch('/api/user?' + new URLSearchParams({
                    roomId: self.roomId,
                    'name': input.value,
                }).toString())
                .then((response) => response.json())
                .then(data => {
                    if(data?.users?.length) {
                        list.innerHTML = '';
                        for(const user of data.users) {
                            const div = document.createElement('div');
                            const radio = document.createElement('input');
                            radio.type = 'checkbox';
                            radio.name = user.name;
                            radio.dataset.userid = user.id;
                            radio.checked = false;
                            div.appendChild(radio)
                            div.appendChild(document.createTextNode(' ' + user.name));
                            list.appendChild(div);
                        }
                        const add = document.createElement('button');
                        add.classList.add('btn');
                        add.appendChild(document.createTextNode('Add'));
                        add.type = 'button';
                        list.appendChild(add);
                        add.addEventListener('click', self.sendInvitation.bind(self));
                    } else {
                        list.innerHTML = '\nno users found';
                    }
                });
            }
        });

        let note = document.createTextNode('write more then 3 characters of user name and hit enter, pay attention on user name, on once you can see only 10 users');
        list.appendChild(note);

        input.focus();
    }

    async sendInvitation(event) {
        const self = this;
        const list = event.target.parentNode;
        const usersId = [];
        for(const item of list.children) {
            if(item.nodeName !== 'DIV') {
                break;
            }
            const check = item.querySelector('input[type=checkbox]');
            if(check.checked) {
                usersId.push(parseInt(check.dataset.userid));
            }
        }
        if(usersId.length){
            return fetch(`/api/room/seat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ users: usersId, roomId: self.roomId })
            })
            .then(async (response) => {
                const data = await response.json();
                console.log(data);
                // self.modal.close();
            })
            .catch((error) => {
                console.error('Error:', error);
            });
        }
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
