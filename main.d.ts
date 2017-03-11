import { Observable } from 'rxjs/Rx';
export declare type ExchangeType = 'direct' | 'fanout' | 'topic';
export interface ExchangeOptions {
    name: string;
    type: ExchangeType;
}
export declare class AmqpConnector {
    private channel;
    private exchange;
    constructor(url: string, exchange?: ExchangeOptions);
    publish(queue: string, message: any): Promise<any>;
    listen(queue: string): Observable<any>;
}
