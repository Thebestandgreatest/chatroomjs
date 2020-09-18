var chatText = document.getElementById('chat-text');
var chatInput = document.getElementById('chat-input');
var chatForm = document.getElementById('chatForm');
var chatName = document.getElementById('name');
var chatNames = document.getElementById('nameBox')

var socket = io();
var typing = false;

//add a chat cell to chat list view and scroll to the bottom
socket.on('addToChat',function(data, name){
  if (name != 'admin') {
    //if name is admin don't put a name (used for connection messages)
    chatText.innerHTML += '<div style="text-align:left;">' + name + '</div>' + '<div class="chatCell" style="word-wrap: anywhere; text-align: right; padding: 0.5%;">' + data + '</div>';
    chatText.scrollTop = chatText.scrollHeight;
  } else if (name == 'admin') {
    chatText.innerHTML += '<div class="chatCell" style="word-wrap: anywhere; text-align: right; padding: 0.5%; color:gray;">' + data + '</div>';
  } else {
    console.error('unknown sender');
  }
});

//called when sent by server
socket.on('update-names', function(namelist) {
  //clears list and redraws it with active users
  chatNames.innerHTML = '';
  for (var i in namelist) {
    chatNames.innerHTML += '<div style="text-align:center;">' + namelist[i];
  }
});

//gets current clients nickname from the server and puts it at the top
socket.on('send-nickname', function(nickname) {
  chatName.innerHTML = nickname;
})

chatForm.onsubmit = function(e){
  //prevent the form from refreshing the page
  e.preventDefault();
  //checks that the message isn't empty
  if (chatInput.value.trim() != '') {
    //sends the message to the server
    socket.emit('sendMsgToServer', chatInput.value);
  }
  chatInput.value = '';
}

document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('chat-input').addEventListener('focus', function() {
    typing = true;
  });
  document.getElementById('chat-input').addEventListener('blur', function() {
    typing = false;
  });
});

document.onkeyup = function(event){
  //pressed enter key
  if(event.keyCode === 13){
    if(!typing){
      //user is not already typing, focus input
      chatInput.focus();
    }
  }
}
