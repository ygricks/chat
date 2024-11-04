import { UseGeneralTemplate } from '../common';
import { Request, Response } from 'express';
import { hasUserInRoom } from '../model';

export async function pageRoomChat(request: Request, response: Response) {
    const userId = request.body.user.id;
    const roomId = parseInt(request.params.id);

    const seat = await hasUserInRoom(roomId, userId);
    if (!seat) {
        return response
            .status(403)
            .json({ error: 'you are not in that room!' });
    }
    const content = `
        <div class="chat">
            <div class="chat-line">
                <div id="chat-history"></div>
            </div>
            <div class="chat-actions">
                <input type="text" id="chat-input" autocomplete="off" autoFocus />
                <div id="chat-send">⌲</div>
            </div>
        </div>`;
    const data = UseGeneralTemplate({
        body: content,
        head: '<script src="/chat.js"></script>',
        title: '--chat-room--'
    });

    return response.status(200).set('Content-Type', 'text/html').send(data);
}
