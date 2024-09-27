import EventBus from 'js-event-bus';


export class SingletonEventBus {
    private static instance?: EventBus = undefined;
  
    private constructor() {}
  
    public static getInstance(): EventBus {
        if (this.instance === undefined) {
            this.instance = new EventBus();
        }

        return this.instance;
    }
}
