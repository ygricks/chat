export interface ISession {
    id: number;
    user_id: number;
    hash: string;
    created_at: Date;
    expired_at: Date;
}
