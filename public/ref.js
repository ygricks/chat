function validate(name, pass, pass2) {
    const validPass = pass.length >= 6 && pass.length <= 20;
    const validPass2 = validPass && pass == pass2;
    const escapedName = name.match(/[a-z,A-Z,0-9]+/g)?.join('');
    const validName =
        escapedName === name && name.length >= 3 && name.length < 10;
    return { validName, validPass, validPass2 };
}

function colorize(element, status) {
    const cls =
        status === -1
            ? 'border-golden'
            : status
            ? 'border-green'
            : 'border-red';
    element.className = '';
    element.classList.add(cls);
}

function start_ref() {
    const refId = document.querySelector('input[name="ref_id"]').value;
    const nameEl = document.querySelector('input[name="username"]');
    const log = document.querySelector('input[name="password"]');
    const log1 = document.querySelector('input[name="password_check"]');

    const checkBtn = document.querySelector('button#check');
    const registerBtn = document.querySelector('button#register');

    checkBtn.addEventListener('click', () => {
        const { validName, validPass, validPass2 } = validate(
            nameEl.value,
            log.value,
            log1.value
        );

        colorize(nameEl, validName ? -1 : false);
        colorize(log, validPass ? -1 : false);
        colorize(log1, validPass2 ? -1 : false);

        fetch(`/api/ref/${refId}/loginCheck`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: nameEl.value, password: log.value })
        })
            .then((response) => response.json())
            .then((data) => {
                const done = !!data?.done;
                colorize(nameEl, done);
                colorize(log, done);
                colorize(log1, done);
            });
    });

    registerBtn.addEventListener('click', () => {
        const { validName, validPass, validPass2 } = validate(
            nameEl.value,
            log.value,
            log1.value
        );

        if (!validName || !validPass || !validPass2) {
            colorize(nameEl, validName ? -1 : false);
            colorize(log, validPass ? -1 : false);
            colorize(log1, validPass2 ? -1 : false);
            return;
        }

        fetch(`/api/ref/${refId}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: nameEl.value, password: log.value })
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.done) {
                    window.location.href = '/login';
                }
            })
            .catch((err) => {
                throw new Error(err);
            });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const ref = window.location.pathname.split('/')[1];
    if (ref === 'ref') {
        start_ref();
    }
});
