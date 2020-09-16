var express = require('express');
var app = express();
var Name = require('./names.js');

var server = require('http').createServer(app);

function saveMessage(data,name) {
	var arr=[data,name];
	datalist.push(arr);
}

app.get('/',function(req, res) {
	res.sendFile(__dirname + '/client/index.html');
});
app.use('/client',express.static(__dirname + '/client'));

console.log('Server started.');

var clients = {};
var datalist= [];
var names = [];

var io = require('socket.io')(server);

//listens for connection from client
io.sockets.on('connection', function(socket){
  socket.username = Name.generate();
  console.log(socket.username +' joined');
  var socketId = Math.random();
  clients[socketId] = socket;
	clients[socketId].emit('send-nickname', socket.username);
	names.push(socket.username);
  //loads all saved messages from ram into client that just connected in the chat
  for (var j in datalist) {
   clients[socketId].emit('addToChat', datalist[j][0] ,datalist[j][1]);
 	}

	for (var i in clients) {
		clients[i].emit('addToChat', socket.username + ' connected', 'admin');
	}
	saveMessage(socket.username + ' connected', 'admin');

	//sends updated list of people chatting
	for (var i in clients) {
		clients[i].emit('update-names', names);
	}

//listens for message sent
  socket.on('sendMsgToServer',function(data, name){
    console.log(socket.username + ' said ' + data);
    saveMessage(data,socket.username);
    for (var i in clients){
      clients[i].emit('addToChat', data, socket.username);
    }
  });

//listens for client disconnect
  socket.on('disconnect',function(){
		names.splice(names.indexOf(socket.username), 1);
    console.log(socket.username + ' disconnected ' + names.length);

		for (var i in clients) {
			var message = socket.username + ' disconnected'
			clients[i].emit('addToChat', message, 'admin');
			saveMessage(message,'admin')

			clients[i].emit('update-names', names);
		}

    delete clients[socketId];
		if (names.length == 0) {
			console.log('history cleared')
	    datalist = [];
	  }
	});
});

server.listen(8080);
