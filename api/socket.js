const httpServer = require('http').createServer(app)
const io = require('socket.io')(httpServer, {})

const playerList = []

io.on('connection', socket => {
    console.log(`[CONNECT]:`, socket.id)

    playerList.push(socket.id)

    socket.on("disconnect", (reason) => {
        console.log(`[DISCONNECT]: ${reason}`)
    })

    io.emit("players", playerList)
})

httpServer.listen(80)