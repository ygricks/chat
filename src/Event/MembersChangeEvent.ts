import { IMember } from '../interfaces';
import { BaseEvent, EventType } from './BaseEvent';

// @TODO need to implement, is not used yet
export class MembersChangeEvent extends BaseEvent {
    constructor(members: IMember[]) {
        super(EventType.MembersChange, members);
    }
}
