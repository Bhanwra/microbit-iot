const { ipcRenderer } = require("electron")

console.log("OLA@")

window.addEventListener('DOMContentLoaded', () => {

    // close button
    const closeButton = document.getElementById('closeButton')
    closeButton.addEventListener('click', closeApp)
})

const closeApp = () => {
    ipcRenderer.invoke('app_close')
}