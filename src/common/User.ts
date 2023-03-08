export class IUser {
    public readonly id: number;
    public readonly name: string;
    constructor(id: number, name: string) {
        this.id = id;
        this.name = name;
    }
}
