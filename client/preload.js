const { ipcRenderer } = require("electron")

let device = false

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
})