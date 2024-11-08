import { call404, UseGeneralTemplate } from '../common';

import { Request, Response } from 'express';
import { getRef } from '../modules/ref';

export async function pageRegister(request: Request, response: Response) {
    const refName = String(request.params.ref_name);
    const ref = await getRef(refName);

    const content = `
            <div class="flex-container">
            <form id="loginform" class="flex-row" action="/api/login" method="post">
                <div class="flex-item">
                    <p>pay attention</p>
                    <p>after register you would not be able to change it</p>
                    <p>or reset your password</p>
                    <input type="hidden" name="ref_id" value="${refName}" />
                    <input
                        type="text"
                        name="username"
                        placeholder="username"
                    /><br />
                    <input
                        type="text"
                        name="password"
                        placeholder="password"
                    /><br />
                    <input
                        type="text"
                        name="password_check"
                        placeholder="password"
                    /><br />
                    <button id="check" type="button" class="btn btn-gold">check</button>
                    <button id="register" type="button" class="btn">register</button>
                </div>
            </form>
        </div>`;

    if (!ref?.id) {
        const html = await call404();
        return response.status(404).send(html);
    }
    const data = UseGeneralTemplate({
        body: content,
        head: '<script src="/ref.js"></script>',
        title: '--register--'
    });

    return response.status(200).set('Content-Type', 'text/html').send(data);
}
