var express = require('express');
var app = express();
var open = require('amqplib').connect('amqp://@localhost');
var messageToSend = {};
var response = {};

app.get('/ping', function (req, res) {
  response = res;
  var messageToPong = sendMessageToPong();
  messageToPong.then(function(responseToMessageSend){
    if(responseToMessageSend){
      getMessage().then(function(messageFromPong){
        res.send(messageFromPong.content.toString());
      });
    }
  });
});

function getMessage(){
  return reciveMessageFromPong().then(function(message){
    console.log('MESSAGE', message);
    if(!message){
      return getMessage();
    }else{
      return message;
    }
  });
}
function sendMessageToPong(){
  return open.then(function(conn) {
    return conn.createChannel();
  }).then(function(channel) {
    return channel.assertQueue('PING_QUEUE').then(function(ok) {
      return channel.sendToQueue('PING_QUEUE', new Buffer('PING_MESSAGE'));
    });
  }).catch(console.warn);
}

function reciveMessageFromPong(){
  return open.then(function(conn) {
    return conn.createChannel();
  }).then(function(channel) {
    return channel.assertQueue('PONG_QUEUE').then(function(ok){
      channel.ackAll();
      return channel.get('PONG_QUEUE');
    });
  }).catch(console.warn);
}

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
