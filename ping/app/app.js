var express = require('express');
var app = express();
var open = require('amqplib').connect('amqp://@localhost');;
var messageToSend = {};

app.get('/ping', function (req, res) {
  var messageToPong = sendMessageToPong();
  messageToPong.then(function(responseToMessageSend){
    console.log(responseToMessageSend);
    if(responseToMessageSend){
      reciveMessageFromPong(res).then(function(messageFromPong){
        res.send(messageToSend);
      });
    }
  })
});

function sendMessageToPong(){
  return open.then(function(conn) {
    return conn.createChannel();
  }).then(function(channel) {
    return channel.assertQueue('PING_QUEUE').then(function(ok) {
      return channel.sendToQueue('PING_QUEUE', new Buffer('PING_MESSAGE'));
    });
  }).catch(console.warn);
}

function reciveMessageFromPong(res){
  return open.then(function(conn) {
    return conn.createChannel();
  }).then(function(channel) {
    return channel.assertQueue('PONG_MESSAGE').then(function(ok){
      return channel.consume('PONG_QUEUE', function(msg) {
        channel.ack(msg);
        messageToSend.message = msg.content.toString();
      });
    });
  }).catch(console.warn);
}
app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
