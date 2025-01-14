import { IMessage } from '../interfaces';
import { Unread } from '../modules/user';
import { BaseEvent, EventType } from './BaseEvent';

export class NewMessageEvent extends BaseEvent {
    public readonly unread;
    constructor(message: IMessage, unread: Unread) {
        super(EventType.NewMessage, message);
        this.unread = unread;
    }
}
