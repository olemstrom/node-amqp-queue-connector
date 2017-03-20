import { Observable } from 'rxjs/Rx';
export declare type ExchangeType = 'direct' | 'fanout' | 'topic';
export interface ExchangeOptions {
    name: string;
    type: ExchangeType;
}
export interface MessageInfo {
    content: string;
    topic: string;
}
export declare class AmqpConnector {
    private channel;
    private exchange;
    private queue;
    private listener;
    constructor(url: string, queue: string, exchange?: ExchangeOptions);
    publish(topic: string, message: any): Promise<any>;
    listen(topic: string): Observable<any>;
    listenAll(): Observable<any>;
    private initialiseListen;
}
