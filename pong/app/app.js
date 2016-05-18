var express = require('express');
var app = express();
var open = require('amqplib').connect('amqp://@localhost');
var messages = {
  recived: 0,
  answered: 0
};

function listenQueue(){
  open.then(function(connection) {
    return connection.createChannel();
  }).then(function(channel) {
    return channel.assertQueue('PING_QUEUE').then(function(ok) {
      return channel.consume('PING_QUEUE', function(msg) {
        if (msg !== null) {
          console.log('MESSAGES', messages.recived);
          // messages.recived
          messages.recived++;
          console.log(msg.content.toString());
          channel.ack(msg);
          responseMessageToPingApp(channel);
        }
      });
    });
  }).catch(console.warn);
}

function responseMessageToPingApp(channel){
  setTimeout(function(){
    channel.assertQueue('PONG_QUEUE').then(function(ok) {
      var textToSend = 'PONG_MESSAGE'+ Math.random();
      console.log(textToSend);
      var message = channel.sendToQueue('PONG_QUEUE', new Buffer(textToSend));
      if (message) {
        messages.answered++;
      }
    });
  }, 2000);
}
// HTTP GET
app.get('/messages',function(req, res){
  res.send(messages);
});

app.listen(3001, function () {
  console.log('Example app listening on port 3001!');
  listenQueue();
});
