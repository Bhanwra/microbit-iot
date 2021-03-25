const { BrowserWindow, app, ipcMain } = require("electron");
const path = require('path');

const SerialPort = require("serialport");
const Readline = SerialPort.parsers.Readline

const io = require('socket.io-client')
let playerSocket = null

let mainWindow = null, gameWindow = null, leaderboardsWindow = null

let activeGame = false

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1080,
        height: 540,
        frame: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })

    mainWindow.loadFile('index.html')
}

app.whenReady().then(() => {
    createWindow()

    app.on("activate", () => {
        if ( BrowserWindow.getAllWindows().length == 0 ) {
            createWindow()
        }
    })
})

app.on('window-all-closed', () => {
    if ( process.platform !== 'darwin' ) {
        app.quit()
    }
})


// Renderer to Main Events
ipcMain.handle("scan_microbit", (event, args) => {
    let device = scanMicrobit()
})

ipcMain.handle('app_connect', (event, playerName = 'Invalid Name') => {
    // Client = Server Events
    playerSocket = io('http://155.138.143.42/', {
        query: {
            name: playerName
        }
    })

    playerSocket.on("connect", () => {
        console.log("Connected")
    })

    playerSocket.on("players", (playerList) => {
        mainWindow.webContents.send('players_updated', playerList)
    })

    playerSocket.on('show_leaderboards', (score) => {
        leaderboardsWindow.webContents.send('received_leaderboards', score)
    })
})

ipcMain.handle('app_close', (event, args) => {
    app.quit();
})

ipcMain.on('app_home', (event) => {
    console.log("Home requested")
    if ( gameWindow ) {
        gameWindow.hide()
    }
    if ( leaderboardsWindow ) {
        leaderboardsWindow.hide()
    }
    if ( mainWindow ) {
        mainWindow.show()
        if ( playerSocket ) {
            playerSocket.emit('status_update', 'Idle')
        }
    }
})

ipcMain.on('loadGame', (event, gameNum) => {
    console.log("Trying to load: "+ gameNum)
    switch(gameNum) {
        case 1:
        case 2: 
            loadGame(gameNum)
            break
        default:
            console.log("No Game Found")
    }
})

ipcMain.on('status_update', (event, status) => {
    if ( playerSocket ) {
        playerSocket.emit('status_update', status)
    }
})

ipcMain.on('submit_score', (event, gameID, score) => {
    if ( playerSocket ) {
        playerSocket.emit('submit_score', gameID, score)
    }
})

ipcMain.on('loadLeadeboards', (event, gameID) => {
    loadLeaderboards(gameID)
})

ipcMain.on('get_leaderboards', (event, gameID) => {
    if ( playerSocket ) {
        playerSocket.emit('get_leaderboards', gameID)
    }
})

function scanMicrobit() {
    SerialPort.list().then((ports) => {
        ports.forEach(device => {
            if ( ["0d28", "0D28"].includes(device.vendorId) && device.productId == "0204" ) {
                // is a microbit
                console.log("Microbit found!")

                initMicrobit(device)
            }
        })
    })
}

function initMicrobit(device) {
    if ( device != false ) {
        const microBit = new SerialPort(device.path, {
            baudRate: 115200,
            autoOpen: false
        })

        const parser = new Readline()

        microBit.pipe(parser)

        microBit.open(() => {
            console.log("Microbit Port Opened!")

            mainWindow.webContents.send("device_connected", device)

            if ( playerSocket ) {
                console.log("Sending to server")
                playerSocket.emit('microbit_connected', device)
            }

            parser.on('data', (data) => {
                console.log(JSON.stringify(data))

                ipcMain.emit("data", data)

                mainWindow.webContents.send("data", data)

                if ( activeGame == 1 && gameWindow ) {
                    gameWindow.webContents.send("game_input", data)
                }
            })

            // sends a signal to microbit
            ipcMain.on('microbit_send', (event, data) => {
                console.log("signal received", "sending to microbit", data)
                microBit.write(`${data}\n`)
            })
        })
    }
}

function loadGame(gameNum) {
    if ( mainWindow ) {
        mainWindow.hide() 
    
        gameWindow = new BrowserWindow({
            width: 1080,
            height: 540,
            frame: false,
            webPreferences: {
                preload: path.join(__dirname, `games/game${gameNum}.js`)
            },
            show: false
        })
    
        gameWindow.loadFile(`games/game${gameNum}.html`)

        gameWindow.once("ready-to-show", () => {
            activeGame = gameNum
            gameWindow.show()
            
        })
    
    }
}

function loadLeaderboards(gameID) {
    if ( mainWindow ) {
        mainWindow.hide() 
    
        leaderboardsWindow = new BrowserWindow({
            width: 1080,
            height: 540,
            frame: false,
            webPreferences: {
                preload: path.join(__dirname, `games/leaderboards.js`),
                additionalArguments: [`game_ID=${gameID}`]
            },
            show: false
        })
    
        leaderboardsWindow.loadFile(`games/leaderboards.html`)

        leaderboardsWindow.once("ready-to-show", () => {
            leaderboardsWindow.show()
        })
    
    }
}