import { IMember, IMessage } from '../interfaces';

export enum EventType {
    NewMessage = 'newMessage',
    MembersChange = 'membersChange'
}

type EventData = IMessage | IMember[];

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
