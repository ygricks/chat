import { IPublicUser } from '../interfaces';
import { BaseEvent, EventType } from './BaseEvent';

export type MembersChangeType = { add: IPublicUser[]; kick: IPublicUser[] };

export class MembersChangeEvent extends BaseEvent {
    constructor(eventData: MembersChangeType) {
        super(EventType.MembersChange, eventData);
    }
}
