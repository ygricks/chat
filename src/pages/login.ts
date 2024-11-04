import { UseGeneralTemplate } from '../common';

import { Request, Response } from 'express';

export function pageLogin(request: Request, response: Response) {
    const content = `
            <div class="flex-container">
            <form id="loginform" class="flex-row" action="/api/login" method="post">
                <div class="flex-item">
                    <input
                        type="text"
                        name="username"
                        placeholder="username"
                        value="igor"
                    /><br />
                    <input
                        type="text"
                        name="password"
                        placeholder="password"
                        value="123"
                    /><br />
                    <input id="signin" type="button" value="sign in" />
                </div>
            </form>
        </div>`;
    const data = UseGeneralTemplate({
        body: content,
        head: '',
        title: '--login--'
    });

    return response.status(200).set('Content-Type', 'text/html').send(data);
}
