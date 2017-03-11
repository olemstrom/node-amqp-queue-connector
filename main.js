"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var amqp = require("amqplib");
var Rx_1 = require("rxjs/Rx");
var initialiseQueue = function (queue, exchange, channel) { return Promise.all([
    channel.assertQueue(queue),
    channel.bindQueue(queue, exchange, '*')
]); };
var sendToQueue = function (queue, message, channel) { return channel.sendToQueue(queue, new Buffer(message)); };
var consume = function (topic, channel) {
    var sub = new Rx_1.BehaviorSubject(undefined);
    channel.assertQueue(topic).then(function (ok) { return channel.consume(topic, function (msg) {
        if (msg) {
            sub.next(msg.content.toString());
            channel.ack(msg);
        }
    }); });
    return sub.asObservable();
};
var AmqpConnector = (function () {
    function AmqpConnector(url, exchange) {
        if (exchange === void 0) { exchange = { name: 'default-fanout', type: 'fanout' }; }
        this.channel = amqp.connect(url)
            .then(function (c) { return c.createChannel(); })
            .then(function (channel) { return channel.assertExchange(exchange.name, exchange.type).then(function () { return channel; }); })
            .catch(function (error) {
            throw error;
        });
        this.exchange = exchange.name;
    }
    AmqpConnector.prototype.publish = function (queue, message) {
        var _this = this;
        var send = sendToQueue.bind(null, queue, JSON.stringify(message));
        return this.channel.then(function (channel) {
            return initialiseQueue(queue, _this.exchange, channel)
                .then(function () { return sendToQueue(queue, JSON.stringify(message), channel); });
        }).catch(console.error);
    };
    AmqpConnector.prototype.listen = function (queue) {
        var _this = this;
        return Rx_1.Observable.fromPromise(this.channel)
            .switchMap(function (channel) {
            return initialiseQueue(queue, _this.exchange, channel).then(function () { return consume(queue, channel); });
        })
            .filter(function (val) { return Boolean(val); })
            .catch(function (err) {
            console.error(err);
            return Rx_1.Observable.throw(err);
        });
    };
    return AmqpConnector;
}());
exports.AmqpConnector = AmqpConnector;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInNyYy9tYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsOEJBQWdDO0FBRWhDLDhCQUE4RDtBQUU5RCxJQUFNLGVBQWUsR0FBRyxVQUFDLEtBQWEsRUFBRSxRQUFnQixFQUFFLE9BQWdCLElBQUssT0FBQSxPQUFPLENBQUMsR0FBRyxDQUFDO0lBQ3ZGLE9BQU8sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDO0lBQzFCLE9BQU8sQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBQyxHQUFHLENBQUM7Q0FDekMsQ0FBQyxFQUg2RSxDQUc3RSxDQUFDO0FBRUgsSUFBTSxXQUFXLEdBQUcsVUFBQyxLQUFhLEVBQUUsT0FBWSxFQUFFLE9BQWdCLElBQUssT0FBQSxPQUFPLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUEvQyxDQUErQyxDQUFDO0FBRXZILElBQU0sT0FBTyxHQUFHLFVBQUMsS0FBYSxFQUFFLE9BQWdCO0lBQzVDLElBQU0sR0FBRyxHQUFpQixJQUFJLG9CQUFlLENBQUMsU0FBUyxDQUFDLENBQUM7SUFFekQsT0FBTyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBQSxFQUFFLElBQUksT0FBQSxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxVQUFDLEdBQVk7UUFDdEUsRUFBRSxDQUFBLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNMLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1lBQ2pDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDckIsQ0FBQztJQUNMLENBQUMsQ0FBQyxFQUxvQyxDQUtwQyxDQUFDLENBQUM7SUFFSixNQUFNLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBRSxD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