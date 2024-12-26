import { IMember } from '../interfaces';
import { BaseEvent } from './BaseEvent';

// @TODO need to implement, is not used yet
export class NewMembersEvent extends BaseEvent {
    constructor(members: IMember[]) {
        super('newMembers', members);
    }
}
