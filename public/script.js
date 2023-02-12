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

const start = async function(){
    const roomId = parseInt(window.location.pathname.split('/').pop());
    if(roomId < 1) {
        throw new Error(`Invalid roomId: ${roomId}`);
    }
    const renderMess = template('messTemplate');
    const history = document.getElementsByClassName('chat-history')[0];
    const input = document.getElementsByClassName('chat-input')[0];

    const messages = await getMessages(roomId);
    messages.map((mess, key) => {
        messages[key] = renderMess({id:mess.id, mess: mess.mess, me:mess.author==='igor'?'me':''});
    });
    splitMess = messages.join('');
    history.innerHTML = history.innerHTML + splitMess;

    document.addEventListener('keyup',(e)=>{
        if(e.key === 'Enter' && e.target === input && input.value.length) {
            const message = input.value;
            input.disabled = true;

        }
    })
};

document.addEventListener('DOMContentLoaded', start);
