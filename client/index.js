const { BrowserWindow, app, ipcMain } = require("electron");
const path = require('path');

const SerialPort = require("serialport");
const Readline = SerialPort.parsers.Readline

const io = require('socket.io-client')
let playerSocket = null

let window = null;

function createWindow() {
    window = new BrowserWindow({
        width: 1080,
        height: 540,
        frame: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })

    window.loadFile('index.html')
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

ipcMain.handle("scan_microbit", (event, args) => {
    let device = scanMicrobit()
})

ipcMain.handle('app_connect', (event, playerName = 'Invalid Name') => {
    playerSocket = io('http://155.138.143.42/', {
        query: {
            name: playerName
        }
    })

    playerSocket.on("connect", () => {
        console.log("Connected")
    })

    playerSocket.on("players", (playerList) => {
        window.webContents.send('players_updated', playerList)
    })
})

ipcMain.handle('app_close', (event, args) => {
    app.quit();
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

            window.webContents.send("device_connected", device)

            if ( playerSocket ) {
                console.log("Sending to server")
                playerSocket.emit('microbit_connected', device)
            }

            parser.on('data', (data) => {
                console.log(JSON.stringify(data))

                ipcMain.emit("data", data)

                window.webContents.send("data", data)
            })

            // sends a signal to microbit
            ipcMain.on('microbit_send', (event, data) => {
                console.log("signal received", "sending to microbit", data)
                microBit.write(`${data}\n`)
            })
        })
    }
} 