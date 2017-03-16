"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var amqp = require("amqplib");
var Rx_1 = require("rxjs/Rx");
var initialiseQueue = function (queue, exchange, channel) { return Promise.all([
    channel.assertQueue(queue)
]); };
var publishTo = function (exchange, topic, message, channel) { return channel.publish(exchange, topic, new Buffer(message)); };
;
var AmqpConnector = (function () {
    function AmqpConnector(url, queue, exchange) {
        if (exchange === void 0) { exchange = { name: 'default-fanout', type: 'fanout' }; }
        var _this = this;
        this.listener = new Rx_1.BehaviorSubject(undefined);
        this.initialiseListen = function (queue, channel) {
            channel.assertQueue(queue)
                .then(function () { return channel.consume(queue, function (msg) {
                if (msg) {
                    _this.listener.next({ content: msg.content.toString(), topic: msg.fields.routingKey });
                    channel.ack(msg);
                }
            }); });
            return _this.listener.asObservable();
        };
        this.exchange = exchange.name;
        this.queue = queue;
        this.channel = amqp.connect(url)
            .then(function (c) { return c.createChannel(); })
            .then(function (channel) { return channel.assertExchange(exchange.name, exchange.type).then(function () { return channel; }); })
            .then(function (channel) { return initialiseQueue(queue, exchange.name, channel).then(function () { return channel; }); })
            .then(function (channel) {
            _this.initialiseListen(_this.queue, channel);
            return channel;
        })
            .catch(function (error) {
            console.error(error);
        });
    }
    AmqpConnector.prototype.publish = function (topic, message) {
        var _this = this;
        return this.channel
            .then(function (channel) { return publishTo(_this.exchange, topic, JSON.stringify(message), channel); })
            .catch(console.error);
    };
    AmqpConnector.prototype.listen = function (topic) {
        var _this = this;
        return Rx_1.Observable.fromPromise(this.channel.then(function (channel) { return channel.bindQueue(_this.queue, _this.exchange, topic); }))
            .switchMap(function () { return _this.listener.asObservable(); })
            .filter(function (val) { return Boolean(val); })
            .filter(function (message) { return message.topic === topic; })
            .map(function (message) { return message.content; })
            .catch(function (err) {
            console.error(err);
            return Rx_1.Observable.throw(err);
        });
    };
    return AmqpConnector;
}());
exports.AmqpConnector = AmqpConnector;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInNyYy9tYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsOEJBQWdDO0FBRWhDLDhCQUE4RDtBQUU5RCxJQUFNLGVBQWUsR0FBRyxVQUFDLEtBQWEsRUFBRSxRQUFnQixFQUFFLE9BQWdCLElBQUssT0FBQSxPQUFPLENBQUMsR0FBRyxDQUFDO0lBQ3ZGLE9BQU8sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDO0NBQzdCLENBQUMsRUFGNkUsQ0FFN0UsQ0FBQztBQUVILElBQU0sU0FBUyxHQUFHLFVBQ2QsUUFBZ0IsRUFDaEIsS0FBYSxFQUNiLE9BQVksRUFDWixPQUFnQixJQUFLLE9BQUEsT0FBTyxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsS0FBSyxFQUFFLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQXJELENBQXFELENBQUM7QUFZOUUsQ0FBQztBQUVGO0lBTUksdUJBQVksR0FBVyxFQUFFLEtBQWEsRUFBRSxRQUFxRTtRQUFyRSx5QkFBQSxFQUFBLGFBQThCLElBQUksRUFBRSxnQkFBZ0IsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFDO1FBQTdHLGlCQWdCQztRQWxCTyxhQUFRLEdBQXlCLElBQUksb0JBQWUsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQXdDaEUscUJBQWdCLEdBQUcsVUFBQyxLQUFhLEVBQUUsT0FBZ0I7WUFDdkQsT0FBTyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUM7aUJBQ3JCLElBQUksQ0FBQyxjQUFNLE9BQUEsT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsVUFBQyxHQUFZO2dCQUM1QyxFQUFFLENBQUEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO29CQUNMLEtBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLEdBQUcsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLEVBQUUsS0FBSyxFQUFFLEdBQUcsQ0FBQyxN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