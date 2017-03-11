import * as amqp from 'amqplib';
import { Channel, Message } from 'amqplib'
import { BehaviorSubject, Subject, Observable } from 'rxjs/Rx'

const initialiseQueue = (queue: string, exchange: string, channel: Channel) => Promise.all([
    channel.assertQueue(queue),
    channel.bindQueue(queue, exchange,'*')
]);

const sendToQueue = (queue: string, message: any, channel: Channel) => channel.sendToQueue(queue, new Buffer(message));

const consume = (topic: string, channel: Channel) => {
    const sub: Subject<any> = new BehaviorSubject(undefined);

    channel.assertQueue(topic).then(ok => channel.consume(topic, (msg: Message) => {
        if(msg) {
            sub.next(msg.content.toString());
            channel.ack(msg);
        }
    }));

    return sub.asObservable();
};

export type ExchangeType = 'direct' | 'fanout' | 'topic';

export interface ExchangeOptions {
    name: string;
    type: ExchangeType;
}

export class AmqpConnector {
    private channel: Promise<Channel>;
    private exchange: string;

    constructor(url: string, exchange: ExchangeOptions = { name: 'default-fanout', type: 'fanout'} ) {
        this.channel = amqp.connect(url)
            .then(c => c.createChannel())
            .then(channel => channel.assertExchange(exchange.name, exchange.type).then(() => channel))
            .catch((error: Error) => {
                throw error
            });

        this.exchange = exchange.name;
    }

    publish(queue: string, message: any): Promise<any> {
        const send = sendToQueue.bind(null, queue, JSON.stringify(message));

        return this.channel.then((channel) => {
            return initialiseQueue(queue, this.exchange, channel)
                .then(() => sendToQueue(queue, JSON.stringify(message), channel))
        }).catch(console.error);
    }

    listen(queue: string): Observable<any> {
        return Observable.fromPromise(this.channel)
            .switchMap(channel => {
                return initialiseQueue(queue, this.exchange, channel).then(() => consume(queue, channel))
            })
            .filter(val => Boolean(val))
            .catch((err: Error) => {
                console.error(err);
                return Observable.throw(err);
            });
    }
}