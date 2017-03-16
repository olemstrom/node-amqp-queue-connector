import * as amqp from 'amqplib';
import { Channel, Message } from 'amqplib'
import { BehaviorSubject, Subject, Observable } from 'rxjs/Rx'

const initialiseQueue = (queue: string, exchange: string, channel: Channel) => Promise.all([
    channel.assertQueue(queue)
]);

const publishTo = (
    exchange: string,
    topic: string,
    message: any,
    channel: Channel) => channel.publish(exchange, topic, new Buffer(message));

export type ExchangeType = 'direct' | 'fanout' | 'topic';

export interface ExchangeOptions {
    name: string;
    type: ExchangeType;
}

export interface MessageInfo {
    content: string;
    topic: string;
};

export class AmqpConnector {
    private channel: Promise<Channel>;
    private exchange: string;
    private queue: string;
    private listener: Subject<MessageInfo> = new BehaviorSubject(undefined);

    constructor(url: string, queue: string, exchange: ExchangeOptions = { name: 'default-fanout', type: 'fanout'} ) {
        this.exchange = exchange.name;
        this.queue = queue;

        this.channel = amqp.connect(url)
            .then(c => c.createChannel())
            .then(channel => channel.assertExchange(exchange.name, exchange.type).then(() => channel))
            .then(channel => initialiseQueue(queue, exchange.name, channel).then(() => channel))
            .then(channel => {
                this.initialiseListen(this.queue, channel);
                return channel;
            })
            .catch((error: Error) => {
                console.error(error);
            });

    }

    publish(topic: string, message: any): Promise<any> {
        return this.channel
            .then((channel) => publishTo(this.exchange, topic, JSON.stringify(message), channel))
            .catch(console.error);
    }

    listen(topic: string): Observable<any> {
        return Observable.fromPromise(
                this.channel.then(channel => channel.bindQueue(this.queue, this.exchange, topic))
            )
            .switchMap(() => this.listener.asObservable())
            .filter(val => Boolean(val))
            .filter((message) => message.topic === topic)
            .map(message => message.content)
            .catch((err: Error) => {
                console.error(err);
                return Observable.throw(err);
            });
    }

    private initialiseListen = (queue: string, channel: Channel): Observable<MessageInfo> => {
        channel.assertQueue(queue)
            .then(() => channel.consume(queue, (msg: Message) => {
                if(msg) {
                    this.listener.next({ content: msg.content.toString(), topic: msg.fields.routingKey });
                    channel.ack(msg);
                }
        }));

        return this.listener.asObservable();
    };
}