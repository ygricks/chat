import { call404, UseGeneralTemplate } from "../common"


import { Request, Response } from 'express';
import { getRef } from "../ref";

export async function pageRegister(
    request: Request,
    response: Response
) {
    const refId = String(request.params.ref_id);
    const ref = await getRef(refId);

    const content = `
            <div class="flex-container">
            <form id="loginform" class="flex-row" action="/api/login" method="post">
                <div class="flex-item">
                    <p>please be patient, remember your data</p>
                    <p>after register you would not be able to change it</p>
                    <p>or reset your password</p>
                    <input type="hidden" name="ref_id" value="${refId}" />
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
                    <input id="signin" class="btn" type="button" value="sign in" />
                </div>
            </form>
        </div>`;

    if(!ref?.id) {
        const html = await call404();
        return response.status(404).send(html);
    }
    const data = UseGeneralTemplate({
        body: content,
        head: '',
        title: '--register--'
    });

    return response.status(200).set('Content-Type', 'text/html').send(data);
}
