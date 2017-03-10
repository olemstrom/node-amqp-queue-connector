import * as amqp from 'amqplib';
import { Channel, Message } from 'amqplib'
import { BehaviorSubject, Subject, Observable } from 'rxjs/Rx'

const sendToQueue = (topic: string, message: any, channel: Channel) => channel.assertQueue(topic).then(ok => channel.sendToQueue(topic, new Buffer(message)));

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

export interface ExchangeOptions {
    name: string;
    type: 'direct' | 'fanout' | 'topic';
}

export class AmqpConnector {
    private channel: Promise<Channel>;

    constructor(url: string, exchange: ExchangeOptions = { name: 'default-fanout', type: 'fanout'} ) {
        this.channel = amqp.connect(url)
            .then(c => c.createChannel)
            .catch((error: Error) => {
                throw error
            });

        this.channel.then(channel => channel.assertExchange(exchange.name, exchange.type))
    }

    publish(queue: string, message: any): Promise<any> {
        const send = sendToQueue.bind(null, queue, JSON.stringify(message));
        return this.channel.then(send).catch(console.error);
    }

    listen(queue: string): Observable<any> {
        return Observable.fromPromise(this.channel)
            .switchMap(consume.bind(null, queue))
            .filter(val => Boolean(val))
            .catch((err: Error) => {
                console.error(err);
                return Observable.throw(err);
            });
    }
}