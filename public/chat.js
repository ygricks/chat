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
        close.appendChild(document.createTextNode('✕'));
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

class Member{
    focus = 'left';
    select = {right: null, left: null};
    names = {right: 'room members', left: 'find new member'}
    content = null;
    findInput = null;
    roomId = null;
    constructor(roomId) {
        this.roomId = roomId;
        this.content = document.createElement('div');
        this.content.setAttribute('id', 'member');
        const block = document.createElement('div');
        block.classList.add('member-block');
        this.content.appendChild(block);
        for(const sideName of ['left', 'right']) {
            const side = document.createElement('div');
            side.dataset.side = sideName;
            side.classList.add('member-side');
            block.appendChild(side);
            const span = document.createElement('span');
            span.innerHTML = this.names[sideName];
            side.appendChild(span);
            const select = document.createElement('select');
            this.select[sideName] = select;
            select.setAttribute('multiple', 'multiple');
            side.appendChild(select);
        }

        fetch(`/api/room/${roomId}/members`)
        .then((response) => response.json())
        .then(data => {
            if(data?.members?.length) {
                for(const user of data.members) {
                    const option = document.createElement('option');
                    option.dataset.id = user.id
                    option.classList.add('inside');
                    option.innerHTML = user.name;
                    this.select.right.appendChild(option);
                }
            }
        });

        const findInput = document.createElement('input');
        findInput.classList.add('member-find')
        this.select.left.parentNode.appendChild(findInput);
        this.findInput = findInput;

        const buttons = document.createElement('div');
        buttons.classList.add('member-buttons');
        this.content.appendChild(buttons);

        const swapBtn = document.createElement('button');
        swapBtn.setAttribute('type', 'button');
        swapBtn.classList.add('btn', 'btn-gold');
        swapBtn.innerHTML = 'SWAP >';
        this.swapBtn = swapBtn;
        buttons.appendChild(swapBtn);

        const saveBtn = document.createElement('button');
        saveBtn.setAttribute('type', 'button');
        saveBtn.classList.add('btn');
        saveBtn.innerHTML = 'Save';
        this.saveBtn = saveBtn;
        buttons.appendChild(saveBtn);

        this.startListen();
    }
    startListen() {
        const self = this;
        // change focus
        for(const select of Object.values(self.select)) {
            select.addEventListener('focus', (e) => {
                const side = e.target.parentNode.dataset.side;
                self.focus = side;
                self.swapBtn.innerHTML = side == 'left' ? 'SWAP >' : '< SWAP';
            });
        }
        // swap items
        self.swapBtn.addEventListener('click', () => {
            const sourceSelect = self.select[self.focus];
            const destinSelect = self.select[self.focus == 'left' ? 'right' : 'left'];
            const selected = Array.from(sourceSelect.options).filter(o => o.selected);
            for(const op of selected){
                destinSelect.appendChild(op);
            }
        });
        // find members
        const { findInput } = self;
        findInput.addEventListener('change', () => {
            if(findInput.value.length >= 3) {
                fetch('/api/user?' + new URLSearchParams({
                    roomId: self.roomId,
                    name: findInput.value
                }).toString())
                .then((response) => response.json())
                .then(data => {
                    if(data?.users) {
                        Array.from(self.select.left.options).filter(o=>!o.classList.contains('inside')).map(o=>o.remove());
                        if(data.users?.length) {
                            for(const user of data.users) {
                                const option = document.createElement('option');
                                option.dataset.id = user.id
                                option.innerHTML = user.name;
                                self.select.left.appendChild(option);
                            }
                        }
                    }
                });
            }
        });
        // save members
        self.saveBtn.addEventListener('click', () => {
            const memIds = [];
            for(const op of Array.from(self.select.right.options)) {
                memIds.push(parseInt(op.dataset.id));
            }
            if(memIds.length) {
                fetch(`/api/room/${self.roomId}/members`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ users: memIds })
                })
                .then(async (response) => {
                    const data = await response.json();
                    if(data?.result != '-1:-1') {
                        self.fix();
                    }
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
            }
        });
    }
    fix() {
        const found = Array.from(this.select.left.querySelectorAll('.inside'));
        for(const op of found) {
            op.classList.remove('inside');
        }
        const member = Array.from(this.select.right.querySelectorAll("option:not(.inside)"));
        for(const op of member) {
            op.classList.add('inside');
        }
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
                    document.location.href = "/";
                    return ;
            }
        }
        this.postMessage(message);
    }

    inviteScript() {
        const self = this;
        const member = new Member(self.roomId);
        const modal = new Modal(member.content);
        member.findInput.focus();
        modal.onClose = () => {
            self.input.focus();
            console.log(member.content)
            member.content.remove();
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
