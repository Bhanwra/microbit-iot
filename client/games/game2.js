const {
    ipcRenderer
} = require("electron")

const gameID = 1
let score = 0

window.addEventListener('DOMContentLoaded', () => {
    // Updating Player Status
    ipcRenderer.send("status_update", "Playing <strong>Microbit React</strong>")

    /**
     * Activating Microbit
     * This would set the activeGame to 1; Any input received from Microbit would also be sent to this controller"
     */
    ipcRenderer.send("microbit_send", "run_game_2")

    const pointAnime = document.getElementById("addpoints")
    const sec_left = document.getElementById("random_seconds")
    const points = document.getElementById("pointAcc")
    const action_name = document.getElementById("action_name")
    const gest_shake = document.getElementById("shake")
    const gest_other = document.getElementById("other_gest")

    let btn_a = document.getElementById("btn_a")
    let btn_b = document.getElementById("btn_b")
    let logo_pressed = document.getElementById("logo_pressed")

    ipcRenderer.on("random_seconds", (event, args) => {
        sec_left.innerHTML = args
    })

    ipcRenderer.on("random_points", (event, args) => {
        points.innerHTML = args

        if (args) {
            pointAnime.classList.add("addpointsAnime");
            setTimeout(function () {
                pointAnime.classList.remove("addpointsAnime");
            }, 500)
        }
    })

    ipcRenderer.on("random_action", (event, args) => {
        action_name.innerHTML = args;

        if (args == "shake") {
            gest_shake.style.display = "block"
            gest_other.style.display = "none"
        } else {
            gest_shake.style.display = "none"
            gest_other.style.display = "block"

            if (args == "A") {
                btn_a.classList.add("active_gest");

                btn_b.classList.remove("active_gest");
                logo_pressed.classList.remove("active_gest");

            } else if (args == "B") {
                btn_b.classList.add("active_gest");

                btn_a.classList.remove("active_gest");
                logo_pressed.classList.remove("active_gest");

            } else if (args == "logo") {
                logo_pressed.classList.add("active_gest");

                btn_a.classList.remove("active_gest");
                btn_b.classList.remove("active_gest");
            } else {
                action_name.innerHTML = "GAME OVER";

                btn_a.classList.remove("active_gest");
                btn_b.classList.remove("active_gest");
                logo_pressed.classList.remove("active_gest");
            }
        }
    })


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