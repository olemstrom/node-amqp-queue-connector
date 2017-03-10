import { Observable } from 'rxjs/Rx';
export interface ExchangeOptions {
    name: string;
    type: 'direct' | 'fanout' | 'topic';
}
export declare class AmqpConnector {
    private channel;
    constructor(url: string, exchange?: ExchangeOptions);
    publish(queue: string, message: any): Promise<any>;
    listen(queue: string): Observable<any>;
}
