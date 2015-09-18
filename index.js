var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var port=process.env.PORT || 5000;
server.listen(port);

app.use(express.static(__dirname + '/public'));
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

var clients = [];
var socketList = [];
var socketInfo = {};
io.sockets.on('connection', function (socket) {
    socket.on('setUsername', function (username) {
        io.sockets.sockets['socketID'] = socket.id;
        socketInfo = {};
        socketInfo['username'] = username;
        socketInfo['connectTime'] = getDateTime();
        socketInfo['socketId'] = socket.id;

        //io.sockets.sockets['nickname'] = username; // same as   socket.nickname = username;
        socket.nickname = username;
        console.log("[ username:socket.id = " + username + ": " + socket.id + ']');
        console.log("'"+socket.nickname + "'' is just connected!!");
        clients.push(username);
        socketList.push(socketInfo);
        console.log("Total connected users : " + clients.length);
        var messageObj = {};
        messageObj['message'] = "<span style='color: green'>'" + socket.nickname + "'' is just connected!!!</span>";
        messageObj['person'] = socket.nickname;
        messageObj['currentTime'] = getDateTime();

        socket.emit('getSocketId', {socketId: socket.id});
        socket.broadcast.emit('onlineClient', {notifyMessage: messageObj});

        updateClientOnlineList();

    });
    function updateClientOnlineList() {
        io.sockets.emit('updateClientOnlineList', {sClients: clients, sSocketList: socketList});
        console.log(socketList);
    }

    socket.on('alertSpecificUser', function (alertedSocketId) {
        socket.broadcast.emit('alertThisClient', {alertedSocketId: alertedSocketId});
        console.log("alerted socket id: "+alertedSocketId);
    });
    socket.on('alertAll', function (data) {
        socket.broadcast.emit('alertAll', {sSocketList: socketList});
        console.log("connected users are alerted ");
    });

    socket.on('messageFromClient', function (cMessageObj) {
        socket.broadcast.emit('braodcastFromServer', {sMessageObj: cMessageObj});
        console.log(cMessageObj);
    });

    socket.on('typing', function (data) {
        console.log(data);
        if (data.typing)
            socket.broadcast.emit('isTyping', {isTyping: true, isTypingMessage: data.person + " is typing ..."});
        else {
            socket.broadcast.emit('isTyping', {isTyping: false, isTypingMessage: ""});
        }
    });


    socket.on('disconnect', function () {

        var messageObj = {};
        messageObj['message'] = "<span style='color: grey'>'" + socket.nickname + "'' is disconnected</span>";
        messageObj['person'] = socket.nickname;
        messageObj['currentTime'] = getDateTime();
        socket.broadcast.emit('offlineClient', {notifyMessage: messageObj});

        updateSocketList(socketList, socket.id);
        console.log("Total connected users : " + clients.length);

        updateClientOnlineList();
    });

    function updateSocketList(socketList, id) {
        for (var i = 0; i < socketList.length; i++) {
            //console.log(id+" " +socketList[i].socketId);
            if (socketList[i].socketId == id) {

                socketList.splice(i, 1);
                break;
            }
        }
    }

    function getDateTime() {
        var date = new Date(); //server time
	////
   	date = new Date(date.getTime()+6*60*60*1000); //bd time
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;

        var month = date.getMonth();
        var day = date.getDate();
        var year = date.getFullYear();
        var dayname = date.getDay();

        var monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"];
        var week = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

        var newDate= day + " " + monthNames[month] + " " + year + " at " + hours + ":" + minutes + ampm;
	console.log(newDate);
	return newDate;
    }


});
