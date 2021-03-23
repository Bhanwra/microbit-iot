const { BrowserWindow, app, ipcMain } = require("electron");
const path = require('path');

const SerialPort = require("serialport");
const Readline = SerialPort.parsers.Readline

const io = require('socket.io-client')
const socket = io('http://localhost/')

let window = null;

function createWindow() {
    window = new BrowserWindow({
        width: 1080,
        height: 540,
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

ipcMain.handle("hello", (event, args) => {
    console.log(args)
})

ipcMain.handle("scan_microbit", (event, args) => {
    let device = scanMicrobit()
})

function scanMicrobit() {
    connectToServer()
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

            parser.on('data', (data) => {
                console.log(data)

                ipcMain.emit("data", data)

                window.webContents.send("data", data)
            })
        })
    }
} 

function connectToServer() {

}

socket.on("connect", () => {
    console.log("Connected to server!")
})