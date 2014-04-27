
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var app = express();
var socketio = require('socket.io');

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.cookieParser());
app.use(express.session({secret: 'svtabyrki4q786as37c785ta8vi56aiw4i8w467acv'}));
app.use(app.router);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);

var server = http.createServer(app);

var roomNumber = 1;
var maxRoom = 4000;
var matchingNum = new Array(maxRoom);

var countUser = 0;

for(var i=0; i<maxRoom; i++){
	matchingNum[i] = 0;
}

var io = socketio.listen(server);
io.set('log level', 2);

io.sockets.on('connection', function (socket) {
	countUser++;
		io.sockets.emit('count', {count: countUser});
	socket.on('login', function(data){
		var address = socket.handshake.address;
		socket.set('ipAddress', address);
		socket.set('name', data.name);
		socket.set('whoareyou', data.whoareyou);
		
		socket.set('winNumber', 0);
		socket.set('loseNumber', 0);
		socket.set('winningStreak', 0); 

		console.log(countUser);
		socket.emit('moveMainPage', {ipAddress: address, name: data.name, whoareyou: data.whoareyou});
	});

	socket.on('message', function(data){
		console.log(data);
		io.sockets.emit('message', {id: data.id, data: data.data});
    });

	socket.on('ready', function(data){
		console.log('ready');
		if(roomNumber >= maxRoom){
			roomNumber = 1;
		}
		matchingNum[roomNumber]++;
		socket.join(roomNumber);
		socket.set('room', roomNumber);
		if(matchingNum[roomNumber] >= 2){
			console.log("매칭상대 찾음!! 재밌게ㄱㄱ // 방번호: " + roomNumber +", 방 인원수: " +  matchingNum[roomNumber]);
			socket.get('userType', function(error, userType){
				console.log(userType);
				if(userType == 1){
					console.log("userType:1");
					io.sockets.in(roomNumber).emit('moveGame', {roomNumber: roomNumber});
				}
				else {
					console.log("userType:2");
					io.sockets.in(roomNumber).emit('moveGame', {roomNumber: roomNumber});
				}
			});
			roomNumber++;
		}
		else {
			socket.set('userType', 1);
			console.log("매칭상대 기다리는중! 방번호: " + roomNumber +", 방 인원수: " +  matchingNum[roomNumber]);
			io.sockets.in(roomNumber).emit('waitGame', {number: roomNumber});
		}
	});

	socket.on('cancelReady', function(data){
		socket.get('room', function(error, room){
			console.log("캔슬됨");
			matchingNum[room]--;
		});
	});

	socket.on('disconnect', function(){
		countUser--;
	});
	
	socket.on('score', function(data){
		console.log("rno: " + data.roomNumber + ", pno: " + data.playerNumber + ", score: " +data.score);
		if( data.playerNumber== 1){
			io.sockets.in(data.roomNumber).emit('score1', {score: data.score, y: data.y});
		}
		else {
			io.sockets.in(data.roomNumber).emit('score2', {score: data.score, y: data.y});
		}
	});
});

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});