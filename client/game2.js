const {
    ipcRenderer
} = require("electron")

let device = false
let connected = false

window.addEventListener('DOMContentLoaded', () => {
    const scanButton = document.getElementById("scanMicrobit")
    const pointAnime = document.getElementById("addpoints")


    const sec_left = document.getElementById("random_seconds")
    const points = document.getElementById("pointAcc")
    const action_name = document.getElementById("action_name")
    const gest_shake = document.getElementById("shake")
    const gest_other = document.getElementById("other_gest")

    let btn_a = document.getElementById("btn_a")
    let btn_b = document.getElementById("btn_b")
    let logo_pressed = document.getElementById("logo_pressed")

    scanButton.addEventListener("click", () => {
        ipcRenderer.invoke("scan_microbit")
    })

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
})