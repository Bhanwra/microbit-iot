const { ipcRenderer } = require("electron")
const { Swiper } = require('swiper')

let device = false
let connected = false

window.addEventListener('DOMContentLoaded', () => {
    const outputObject = document.getElementById("output")
    const scanButton = document.getElementById("scanMicrobit")
    
    const microbitStatusWrapper = document.querySelector('.microbit-status-wrapper')

    scanButton.addEventListener("click", () => {
        ipcRenderer.invoke("scan_microbit")

    })

    ipcRenderer.on("data", (event, args) => {
        outputObject.innerHTML = args
    })

    ipcRenderer.on("device_connected", (event, connectedDevice) => {
        device = connectedDevice

        // document.querySelector(".device-name").innerText = connectedDevice.serialNumber
        let deviceStatus = document.querySelector(".device-status")
        deviceStatus.innerText = "Connected"
        deviceStatus.classList.remove("text-danger")
        deviceStatus.classList.add("text-success")

        microbitStatusWrapper.style.display = "none"
        swiper.update()
    })

    ipcRenderer.on('device_not_found', (event) => {
        microbitStatus.querySelector(".microbit-status") = "No device found ☹"
    })

    ipcRenderer.on('players_updated', (event, playerList) => {
        populatePlayers(playerList)
    })

    // close button
    const closeButton = document.getElementById('closeButton')
    closeButton.addEventListener('click', closeApp)

    const loginForm = document.getElementById("loginForm")
    loginForm.addEventListener("submit", loginAction)

    loginForm.querySelector("input").focus()

    // slider inits
    const gameDescription = document.querySelector(".game-description")

    const selectGame = (swiper) => {
        let selectedSlide = swiper.slides[swiper.activeIndex]
        console.log(selectedSlide.querySelector(".slide-content").getAttribute("data-title"))

        let playAction = () => {
            ipcRenderer.send("loadGame", Number(selectedSlide.querySelector(".slide-content").getAttribute("data-game")))
        }

        let openLeaderboads = () => {
            ipcRenderer.send('loadLeadeboards', Number(selectedSlide.querySelector(".slide-content").getAttribute("data-game")))
        }
        
        document.querySelector(".game-description h3").innerText = selectedSlide.querySelector(".slide-content").getAttribute("data-title")
        document.querySelector(".game-description p").innerText = selectedSlide.querySelector(".slide-content").getAttribute("data-desc")
        document.querySelector(".game-description .btn-play").onclick = playAction
        document.querySelector(".game-description .btn-leaderboards").onclick = openLeaderboads
        document.querySelector('.game-poster .poster-content').innerText = selectedSlide.querySelector(".slide-content").getAttribute("data-title")
    }

    const swiper = new Swiper('.swiper-container', {
        slidesPerView: 3,
        observer: true,
        observeParents: true,
        slideActiveClass: "active",
        slideToClickedSlide: true,
        loop: true,
        on: {
            init: (e) => { selectGame(e) },
            slideChange: (e) => { selectGame(e) }
        }
    })

    ipcRenderer.send("status_update", "Idle")

})

const closeApp = () => {
    ipcRenderer.invoke('app_close')
}

const loginAction = (e) => {
    e.preventDefault()

    let loginInput = document.querySelector("#loginForm input")

    ipcRenderer.invoke('app_connect', loginInput.value)
        .then(() => {
            toggleLoginPane()
        }).catch(err => {
            if ( err ) throw err;
        })
}

const toggleLoginPane = () => {
    let loginPaneCheckbox = document.getElementById("login-check")

    loginPaneCheckbox.checked = (loginPaneCheckbox.checked) ? false : true
}

const populatePlayers = (playerList) => {
    console.log(playerList)

    let friendsWrapper = document.getElementById("friendsWrapper")

    let content = ""

    playerList.forEach(player => {
        let microbit = `<svg class="microbit${ (player.microbit) ? ' connected' : '' }" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:cc="http://creativecommons.org/ns#" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" role="img" aria-labelledby="title  desc" xml:space="preserve" enable-background="new 0 0 280 32.755" viewBox="0 0 52.672001 52.672001" version="1.1" id="svg2" inkscape:version="0.91 r13725" sodipodi:docname="logo.square.white.svg"><sodipodi:namedview   pagecolor="#ff00ff"   bordercolor="#666666"   borderopacity="1"   objecttolerance="10"   gridtolerance="10"   guidetolerance="10"   inkscape:pageopacity="0"   inkscape:pageshadow="2"   inkscape:window-width="1536"   inkscape:window-height="801"   id="namedview14"   showgrid="false"   inkscape:zoom="2.0836233"   inkscape:cx="83.390493"   inkscape:cy="16.071144"   inkscape:window-x="-8"   inkscape:window-y="-8"   inkscape:window-maximized="1"   inkscape:current-layer="svg2" /><rect   id="backgroundrect"   width="195.47368"   height="34.210526"   x="0"   y="18.461473"   class=""   style="fill:none;stroke:none" /><title   id="title"   lang="en-GB">BBC micro:bit</title><desc   id="desc"   lang="en-GB">BBC micro:bit logo</desc><metadata   id="metadata37"><rdf:rdf><cc:work       rdf:about=""><dc:format>image/svg+xml</dc:format><dc:type         rdf:resource="http://purl.org/dc/dcmitype/StillImage" /><dc:title /></cc:work></rdf:rdf><rdf:RDF><cc:Work       rdf:about=""><dc:format>image/svg+xml</dc:format><dc:type         rdf:resource="http://purl.org/dc/dcmitype/StillImage" /><dc:title>BBC micro:bit</dc:title></cc:Work></rdf:RDF></metadata><defs   id="defs35" /><path   inkscape:connector-curvature="0"   class=""   d="m 37.363,29.377 c -1.677,0 -3.035,-1.364 -3.035,-3.042 0,-1.678 1.357,-3.038 3.035,-3.038 1.684,0 3.039,1.36 3.039,3.038 0,1.678 -1.355,3.042 -3.039,3.042 M 15.052,23.3 c -1.677,0 -3.042,1.357 -3.042,3.035 0,1.678 1.363,3.042 3.042,3.042 1.674,0 3.036,-1.364 3.036,-3.042 0,-1.678 -1.363,-3.035 -3.036,-3.035 m -0.003,-5.99 22.576,0 c 4.979,0 9.027,4.047 9.027,9.027 0,4.979 -4.049,9.031 -9.027,9.031 l -22.576,0 c -4.977,0 -9.0299993,-4.053 -9.0299993,-9.031 C 6.0180007,21.357 10.072,17.31 15.049,17.31 m 22.576,24.076 c 8.299,0 15.047,-6.75 15.047,-15.049 0,-8.299 -6.748,-15.051 -15.047,-15.051 l -22.576,0 C 6.7500007,11.286 6.9250488e-7,18.038 6.9250488e-7,26.337 6.9250488e-7,34.636 6.7500007,41.386 15.049,41.386 l 22.576,0"   id="path21"   style="fill:#ffffff"   sodipodi:nodetypes="csssccsssccsssscccsssssc" /></svg>`
        
        content += `
            <div class="friend">
                <span class="bg-dark text-light">A</span>
                <h3 class="friend-info">${player.username}<p>${player.status}</p></h3>
                ${microbit}
            </div>
        `
    })

    friendsWrapper.innerHTML = content
}


const doThis = (num) => {
    console.log("sending from front-end to back-end")
    ipcRenderer.send('microbit_send', num)
}