import { IMessage } from '../interfaces';
import { Unread } from '../modules/user';
import { BaseEvent } from './BaseEvent';

export class NewMessageEvent extends BaseEvent {
    public readonly unread;
    constructor(message: IMessage, unread: Unread) {
        super('newMessage', message);
        this.unread = unread;
    }
}
