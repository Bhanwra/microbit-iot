const { ipcRenderer } = require("electron")

let device = false
let connected = false

window.addEventListener('DOMContentLoaded', () => {
    const outputObject = document.getElementById("output")
    const scanButton = document.getElementById("scanMicrobit")

    scanButton.addEventListener("click", () => {
        ipcRenderer.invoke("scan_microbit")
    })

    ipcRenderer.invoke("hello", "Some Arg")
    
    ipcRenderer.on("data", (event, args) => {
        outputObject.innerHTML = args
    })

    ipcRenderer.on("device_connected", (event, connectedDevice) => {
        console.log("Device Connected")

        device = connectedDevice

        document.querySelector(".device-name").innerText = connectedDevice.serialNumber
        document.querySelector(".device-status").innerText = "Connected"
    })

    const closeButton = document.getElementById('closeButton')
    closeButton.addEventListener('click', closeApp)

    const loginForm = document.getElementById("loginForm")
    loginForm.addEventListener("submit", loginAction)
})

const closeApp = () => {
    ipcRenderer.invoke('app_close')
}

const loginAction = (e) => {
    e.preventDefault()

    let loginInput = document.querySelector("#loginForm input")

    console.log(loginInput.value)
}