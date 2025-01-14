const start_login = function () {
    const button = document.getElementById('signin');
    const form = document.getElementById('loginform');
    if (!button || !form) {
        console.warn('login ellements not found');
        return;
    }

    const serializeForm = function (form) {
        var obj = {};
        var formData = new FormData(form);
        for (var key of formData.keys()) {
            obj[key] = formData.get(key);
        }
        return obj;
    };

    button.addEventListener('click', () => {
        const data = serializeForm(form);
        fetch(`/api/login`, {
            method: 'POST', // or 'PUT'
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then((response) => response.json())
            .then((response) => {
                if (response.done === true) {
                    window.location.href = '/';
                }
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    });
};

document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname.split('/').pop();
    if (path === 'login') {
        start_login();
    }
});
