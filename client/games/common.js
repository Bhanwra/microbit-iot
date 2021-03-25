const { ipcRenderer } = require("electron")

window.addEventListener('DOMContentLoaded', () => {

    // home button
    const homeButton = document.getElementById("homeButton")
    homeButton.onclick = () => {
        console.log("clicked")
        ipcRenderer.send('app_home')
    }

    // close button
    const closeButton = document.getElementById('closeButton')
    closeButton.addEventListener('click', closeApp)

})

const closeApp = () => {
    ipcRenderer.invoke('app_close')
}