import { IMessage } from '../interfaces';
import { MembersChangeType } from './MembersChangeEvent';

export enum EventType {
    NewMessage = 'newMessage',
    MembersChange = 'membersChange'
}

type EventData = IMessage | MembersChangeType;

interface IEvent {
    type: EventType;
    data: EventData;
}

export abstract class BaseEvent implements IEvent {
    constructor(
        public readonly type: EventType,
        public readonly data: EventData
    ) {}
}
