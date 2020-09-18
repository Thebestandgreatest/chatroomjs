const express = require('express');
const app = express();
const Name = require('./names.js');
const port = process.env.PORT;

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

//listens for new connection from a client
io.sockets.on('connection', function(socket){
	//generates a nickname for the client and puts it in the active users list
  socket.username = Name.generate();
  console.log(socket.username +' joined');
  var socketId = Math.random();
  clients[socketId] = socket;
	clients[socketId].emit('send-nickname', socket.username);
	names.push(socket.username);

  //loads all saved messages from memory into client that just connected
  for (var j in datalist) {
   clients[socketId].emit('addToChat', datalist[j][0] ,datalist[j][1]);
 	}

	for (var i in clients) {
		//sends connection message to all clients
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
			//sends message to all connected clients
			var message = socket.username + ' disconnected'
			clients[i].emit('addToChat', message, 'admin');
			saveMessage(message,'admin')

			//removes disconnected client from active users list
			clients[i].emit('update-names', names);
		}

		//removes client from socket list
    delete clients[socketId];
		if (names.length == 0) {
			//clears history if no users are connected
			console.log('history cleared')
	    datalist = [];
	  }
	});
});

//listens on specified port
server.listen(port);
console.log('server is listening on port ' + port);
