import { IMember, IMessage } from '../interfaces';

type EventType =
    | 'newMessage'
    | 'newMembers'
    | 'kickMembers'
    | 'roomKick'
    | 'roomInvite';

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
