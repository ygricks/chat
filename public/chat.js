document.addEventListener('DOMContentLoaded', () => {
    const chat = new Chat();
    chat.start();
});

class Modal {
    bg = undefined;
    modal = undefined;
    onClose = () => {};
    constructor(content) {
        this.bg = document.createElement('div');
        this.bg.setAttribute('id', 'blockModal');
        document.body.appendChild(this.bg);
        this.modal = document.createElement('div');
        this.modal.setAttribute('id', 'modal');
        this.bg.appendChild(this.modal);
        modal.appendChild(content);

        const close = document.createElement('div');
        close.setAttribute('id', 'closeModal');
        close.appendChild(document.createTextNode('✕'));
        close.addEventListener('click', this.close.bind(this));
        const keyUpFn = (event) => {
            if (event.code === 'Escape') {
                document.body.removeEventListener('keyup', keyUpFn);
                this.close();
            }
        };
        document.body.addEventListener('keyup', keyUpFn);
        this.modal.appendChild(close);
    }
    close() {
        this.onClose();
        this.bg.remove();
    }
}

class Member {
    focus = 'left';
    select = { right: null, left: null };
    names = { right: 'room members', left: 'find new member' };
    content = null;
    findInput = null;
    roomId = null;
    constructor(roomId) {
        this.roomId = roomId;

        this.content = document.createElement('div');
        this.content.setAttribute('id', 'member');

        fetch(`/api/room/${this.roomId}/members`)
            .then((response) => response.json())
            .then((data) => {
                if (data && data?.members) {
                    this.build(data);
                } else if (data?.error) {
                    this.content.innerHTML = '';
                    this.content.appendChild(
                        document.createTextNode(data.error)
                    );
                }
            });
    }

    build(data) {
        const block = document.createElement('div');
        block.classList.add('member-block');
        this.content.appendChild(block);
        for (const sideName of ['left', 'right']) {
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

        for (const user of data.members) {
            const option = document.createElement('option');
            option.dataset.id = user.id;
            option.classList.add('inside');
            option.innerHTML = user.name;
            this.select.right.appendChild(option);
        }

        const findInput = document.createElement('input');
        findInput.classList.add('member-find');
        this.select.left.parentNode.appendChild(findInput);
        this.findInput = findInput;
        this.findInput.focus();

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
        for (const select of Object.values(self.select)) {
            select.addEventListener('focus', (e) => {
                const side = e.target.parentNode.dataset.side;
                self.focus = side;
                self.swapBtn.innerHTML = side == 'left' ? 'SWAP >' : '< SWAP';
            });
        }
        // swap items
        self.swapBtn.addEventListener('click', () => {
            const sourceSelect = self.select[self.focus];
            const destinSelect =
                self.select[self.focus == 'left' ? 'right' : 'left'];
            const selected = Array.from(sourceSelect.options).filter(
                (o) => o.selected
            );
            for (const op of selected) {
                destinSelect.appendChild(op);
            }
        });
        // find members
        const { findInput } = self;
        findInput.addEventListener('change', () => {
            if (findInput.value.length >= 3) {
                fetch(
                    '/api/user?' +
                        new URLSearchParams({
                            roomId: self.roomId,
                            name: findInput.value
                        }).toString()
                )
                    .then((response) => response.json())
                    .then((data) => {
                        if (data?.users) {
                            Array.from(self.select.left.options)
                                .filter((o) => !o.classList.contains('inside'))
                                .map((o) => o.remove());
                            if (data.users?.length) {
                                for (const user of data.users) {
                                    const option =
                                        document.createElement('option');
                                    option.dataset.id = user.id;
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
            for (const op of Array.from(self.select.right.options)) {
                memIds.push(parseInt(op.dataset.id));
            }
            if (memIds.length) {
                fetch(`/api/room/${self.roomId}/members`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ users: memIds })
                })
                    .then(async (response) => {
                        const data = await response.json();
                        if (data?.result != '-1:-1') {
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
        for (const op of found) {
            op.classList.remove('inside');
        }
        const member = Array.from(
            this.select.right.querySelectorAll('option:not(.inside)')
        );
        for (const op of member) {
            op.classList.add('inside');
        }
    }
}

class Chat {
    modal = undefined;
    constructor() {
        let problem = [];

        this.roomId = parseInt(window.location.pathname.split('/').pop());

        this.userId = parseJwt(getCookieValue('TOKEN'))['id'];
        if (this.roomId < 1) {
            problem.push(`room id problem "${roomId}"`);
        }
        this.history = document.getElementById('chat-history');
        this.input = document.getElementById('chat-input');
        this.sendButton = document.getElementById('chat-send');

        if (!this.input || !this.history) {
            problem.push('chat dom elements problem');
        }

        if (problem.length) {
            throw new Error(`Error: ${problem.join(' && ')}`);
        }
        this.lastMessage = 0;
    }

    addUsers(users) {
        if (!this.users) {
            this.users = {};
        }
        for (const user of users) {
            this.users[user.id] = {
                id: user.id,
                name: user.name,
                color: Math.floor(
                    Math.abs(Math.sin(user.id) * 16777215)
                ).toString(16)
            };
        }
    }

    userAvatar(userId) {
        if (!this.avatars) {
            this.avatars = {};
        }
        if (!this.avatars[userId]) {
            const avatar = document.createElement('div');
            const user = this.users[userId];
            const style = user
                ? `background:#${user.color}`
                : 'background:white;border:1px solid red';
            avatar.setAttribute('style', style);
            avatar.setAttribute('title', user ? user.name : 'was removed');
            avatar.classList.add('avatar');
            avatar.innerHTML = user ? user.name[0].toUpperCase() : 'E';
            this.avatars[userId] = avatar;
            return avatar;
        }
        return this.avatars[userId].cloneNode(true);
    }

    async start() {
        const chatData = await getChatData(this.roomId);
        const { messages, users } = chatData;
        this.addUsers(users);
        if (messages.length) {
            this.lastMessage = await this.populateHistory(
                this.history,
                messages
            );
        }
        this.listenSendTriggers();
        this.listenSSE();
    }

    listenSendTriggers() {
        document.addEventListener('keyup', (e) => {
            if (
                e.key === 'Enter' &&
                e.target === this.input &&
                this.input.value.length
            ) {
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
        if (message[0] === '/') {
            switch (message) {
                case '/invite':
                    this.inviteScript();
                    return;
                case '/createRef':
                    this.createRef();
                    return;
                case '/exit':
                case '/quit':
                    document.location.href = '/';
                    return;
            }
        }
        this.postMessage(message);
    }

    createRef() {
        const self = this;
        fetch(`/api/ref`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then((response) => response.json())
            .then((response) => {
                const { ref } = response;
                const link = document.location.origin + '/ref/' + ref;
                const div = document.createElement('div');
                div.classList.add('ref-block');
                const p = document.createElement('p');
                p.innerHTML = link;
                div.appendChild(p);
                const inp = document.createElement('input');
                inp.value = link;
                inp.setAttribute('readonly', 'readonly');
                div.appendChild(inp);
                const btn = document.createElement('button');
                btn.classList.add('btn');
                btn.setAttribute('type', 'button');
                btn.innerHTML = 'copy';
                div.appendChild(btn);

                btn.addEventListener('click', () => {
                    navigator.clipboard.writeText(link);
                });

                const modal = new Modal(div);
                modal.onClose = () => {
                    self.input.focus();
                };
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }

    inviteScript() {
        const self = this;
        const member = new Member(self.roomId);
        const modal = new Modal(member.content);
        modal.onClose = () => {
            self.input.focus();
            member.content.remove();
        };
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
            .then(() => {
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
            const evtSource = new EventSource(`/stream`);
            evtSource.onmessage = async (e) => {
                const event = JSON.parse(e.data);
                if (event.type === 'newMessage') {
                    // TODO inspect
                    this.lastMessage = await self.populateHistory(
                        self.history,
                        [event.mess]
                    );
                } else {
                    console.warn('unknown type', event);
                }
                // TODO remove all roots
                // self.updateMessages.bind(self)(e);
            };
            evtSource.onerror = () => {
                evtSource.close();
                retryCount++;
                if (retryCount < 15) {
                    if (retryCount === 5) {
                        retryDelay = 1e4;
                    } else if (retryCount === 10) {
                        retryDelay = 6e4;
                    }

                    setTimeout(() => {
                        connect();
                    }, retryDelay);
                } else {
                    console.error((new Date).toISOString(), new Error(`Can't reconect to sse stream`));
                }
            };
        };
        connect();
    }

    async updateMessages(event) {
        const updates = await getRoomUpdates(this.roomId, this.lastMessage);
        if (updates.length) {
            this.lastMessage = await this.populateHistory(
                this.history,
                updates
            );
        }
    }
    // --------------

    async populateHistory(history, messages) {
        let lastMessage;
        let lastMessageElement;

        if (!lastMessage && messages[0].id) {
            lastMessage = messages[0].id;
        }
        for (const message of messages) {
            const id = parseInt(message.id);
            if (id > lastMessage) {
                lastMessage = id;
            }
            const messElement = this.coverMessage(message);
            history.appendChild(messElement);
            lastMessageElement = messElement;
        }
        lastMessageElement.scrollIntoView();
        return Promise.resolve(lastMessage);
    }

    coverMessage(message) {
        const div = document.createElement('div');
        const classes = ['mess'];

        const me = message.created_by == this.userId;
        if (me) {
            classes.push('me');
        } else {
            const avatar = this.userAvatar(message.created_by);
            div.appendChild(avatar);
        }

        div.classList.add(...classes);
        div.dataset.id = message.id;
        div.appendChild(document.createTextNode(message.mess));
        const span = document.createElement('span');
        const dt = new Date(message.created_at);
        const min = dt.getMinutes();
        span.textContent = dt.getHours() + ':' + (min < 10 ? '0' + min : min);
        div.appendChild(span);
        return div;
    }
}

async function getChatData(roomId) {
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

function parseJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
        window
            .atob(base64)
            .split('')
            .map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join('')
    );

    return JSON.parse(jsonPayload);
}

function getCookieValue(name) {
    const regex = new RegExp(`(^| )${name}=([^;]+)`);
    const match = document.cookie.match(regex);
    if (match) {
        return match[2];
    }
}
