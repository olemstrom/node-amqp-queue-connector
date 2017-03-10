"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var amqp = require("amqplib");
var Rx_1 = require("rxjs/Rx");
var sendToQueue = function (topic, message, channel) { return channel.assertQueue(topic).then(function (ok) { return channel.sendToQueue(topic, new Buffer(message)); }); };
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
            .then(function (c) { return c.createChannel; })
            .catch(function (error) {
            throw error;
        });
        this.channel.then(function (channel) { return channel.assertExchange(exchange.name, exchange.type); });
    }
    AmqpConnector.prototype.publish = function (queue, message) {
        var send = sendToQueue.bind(null, queue, JSON.stringify(message));
        return this.channel.then(send).catch(console.error);
    };
    AmqpConnector.prototype.listen = function (queue) {
        return Rx_1.Observable.fromPromise(this.channel)
            .switchMap(consume.bind(null, queue))
            .filter(function (val) { return Boolean(val); })
            .catch(function (err) {
            console.error(err);
            return Rx_1.Observable.throw(err);
        });
    };
    return AmqpConnector;
}());
exports.AmqpConnector = AmqpConnector;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInNyYy9tYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsOEJBQWdDO0FBRWhDLDhCQUE4RDtBQUU5RCxJQUFNLFdBQVcsR0FBRyxVQUFDLEtBQWEsRUFBRSxPQUFZLEVBQUUsT0FBZ0IsSUFBSyxPQUFBLE9BQU8sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQUEsRUFBRSxJQUFJLE9BQUEsT0FBTyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBL0MsQ0FBK0MsQ0FBQyxFQUF0RixDQUFzRixDQUFDO0FBRTlKLElBQU0sT0FBTyxHQUFHLFVBQUMsS0FBYSxFQUFFLE9BQWdCO0lBQzVDLElBQU0sR0FBRyxHQUFpQixJQUFJLG9CQUFlLENBQUMsU0FBUyxDQUFDLENBQUM7SUFFekQsT0FBTyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBQSxFQUFFLElBQUksT0FBQSxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxVQUFDLEdBQVk7UUFDdEUsRUFBRSxDQUFBLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNMLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1lBQ2pDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDckIsQ0FBQztJQUNMLENBQUMsQ0FBQyxFQUxvQyxDQUtwQyxDQUFDLENBQUM7SUFFSixNQUFNLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBRSxDQUFDO0FBQzlCLENBQUMsQ0FBQztBQU9GO0lBR0ksdUJBQVksR0FBVyxFQUFFLFFBQXFFO1FBQXJFLHlCQUFBLEVBQUEsYUFBOEIsSUFBSSxFQUFFLGdCQUFnQixFQUFFLElBQUksRUFBRSxRQUFRLEVBQUM7UUFDMUYsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQzthQUMzQixJQUFJLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxDQUFDLENBQUMsYUFBYSxFQUFmLENBQWUsQ0FBQzthQUMxQixLQUFLLENBQUMsVUFBQyxLQUFZO1lBQ2hCLE1BQU0sS0FBSyxDQUFBO1FBQ2YsQ0FBQyxDQUFDLENBQUM7UUFFUCxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFBLE9BQU8sSUFBSSxPQUFBLE9BQU8sQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQXBELENBQW9ELENBQUMsQ0FBQTtJQUN0RixDQUFDO0lBRUQsK0JBQU8sR0FBUCxVQUFRLEtBQWEsRUFBRSxPQUFZO1FBQy9CLElBQU0sSUFBSSxHQUFHLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFDcEUsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDeEQsQ0FBQztJQUVELDhCQUFNLEdBQU4sVUFBTyxLQUFhO1FBQ2hCLE1BQU0sQ0FBQyxlQUFVLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7YUFDdEMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO2FBQ3BDLE1BQU0sQ0FBQyxVQUFBLEdBQUcsSUFBSSxPQUFBLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBWixDQUFZLENBQUM7YUFDM0IsS0FBSyxDQUFDLFVBQUMsR0FBVTtZQUNkLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDbkIsTUFBTSxDQUFDLGVBQVUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDakMsQ0FBQyxDQUFDLENBQUM7SUFDWCxDQUFDO0lBQ0wsb0JBQUM7QUFBRCxDQUFDLEFBM0JELElBMkJDO0FBM0JZLHNDQUFhIn0=