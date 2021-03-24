var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

// socket.io
const httpServer = require('http').createServer(app)
const io = require('socket.io')(httpServer, {})

let playerList = []

io.on('connection', (socket) => {
  console.log(`[CONNECT]:`, socket.id)

  let player = {
    socket: socket.id,
    username: (socket.handshake.query.name) ? socket.handshake.query.name : 'Invalid Name',
    microbit: false
  }

  playerConnected(player)

  socket.on("disconnect", (reason) => {
      console.log(`[DISCONNECT]: ${reason}`)
      playerDisconnected(player)
  })

  socket.on('microbit_connected', (device) => {
    console.log(device)
    player.microbit = true
    updatePlayers()
  })
})


httpServer.listen(80)

const playerConnected = (player) => {
  playerList.push(player)
  updatePlayers()
}

const playerDisconnected = (player) => {
  playerList = playerList.filter(item => {
    return item != player
  })
  updatePlayers()
}

const updatePlayers = () => {
  io.emit("players", playerList)
  console.log(playerList)
}