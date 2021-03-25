const { ipcRenderer } = require('electron')

require('./common')

const grid = {
    x: 11,
    y: 11
}

const playerPos = {
    x: Math.floor(grid.x/2),
    y: grid.y - 1
}

const gameID = 1

let enemiesOnScreen = []
const enemyMoveSpeed = 1000
let enemyGenerator = null

const maxEnemies = 10
let lastEnemySpawned = false

let score = 0

let baseGrid = null
playerBox = null

window.addEventListener('DOMContentLoaded', () => {
    baseGrid = document.getElementById("baseGrid")
    baseGrid.style.gridTemplateColumns = `repeat(${grid.x}, 1fr)`
    baseGrid.style.gridTemplateRows = `repeat(${grid.y}, 1fr)`
    
    let baseX = 0, baseY = 0
    while ( baseX < grid.x ) {
        while ( baseY < grid.y ) {
            let box = document.createElement("div")
            box.classList.add('grid-box')
            box.id = `grid_${baseY}_${baseX}`
            baseGrid.appendChild(box)
            baseY++
        }
        baseY = 0
        baseX++
    }

    playerBox = document.querySelector(`#grid_${playerPos.x}_${playerPos.y}`)

    if ( playerBox ) {
        playerBox.classList.add("active")
    }

    let thisEnemy = 0
    enemyGenerator = setInterval(() => {
        if ( thisEnemy < maxEnemies ) {
            thisEnemy++
            if ( thisEnemy == maxEnemies ) {
                lastEnemySpawned = true
                console.log("Last has been spawned")
            }
            spawnEnemy()
        } else {
            clearInterval(enemyGenerator)
        }
    }, 2000)

    // Updating Player Status
    ipcRenderer.send("status_update", "Playing <strong>Microbit Shooter</strong>")

    /**
     * Activating Microbit
     * This would set the activeGame to 1; Any input received from Microbit would also be sent to this controller"
     */
    ipcRenderer.send("microbit_send", "run_game_1")

    ipcRenderer.on("game_input", (event, data) => {
        let input = (data.toString().trim())

        switch ( input ) {
            case 'btn_A': {
                movePlayer((( playerPos.x > 0 ) ? --playerPos.x : playerPos.x))
                break
            }
            case 'btn_B': {
                movePlayer((( playerPos.x < grid.x ) ? ++playerPos.x : playerPos.x))
                break
            }
            case 'btn_LOGO': {
                pewPew()
                break
            }
        }
    })

})

const movePlayer = (by) => {
    if ( baseGrid ) {
        if ( playerBox ) {
            playerBox.classList.remove('active')
        }

        playerBox = document.querySelector(`#grid_${by}_${playerPos.y}`)
        if ( playerBox ) {
            playerBox.classList.add("active")
        }
    }
}

const pewPew = () => {
    let projectile = document.createElement("div")
    projectile.classList.add("projectile")

    if ( baseGrid && playerBox ) {

        baseGrid.appendChild(projectile)

        projectile.style.left = `${Math.round(
            (playerBox.getBoundingClientRect().left - baseGrid.getBoundingClientRect().left)
            +
            (
                (playerBox.getBoundingClientRect().width / 2)
                -
                (projectile.getBoundingClientRect().width / 2)
            )
            )}px`
        
        projectile.style.top = Math.round(baseGrid.getBoundingClientRect().height - projectile.getBoundingClientRect().height) + 'px'

        setTimeout(() => {
            let firstEnemy = getFirstEnemy(playerPos.x)
            console.log("First Enemy", firstEnemy)

            projectile.style.top = (firstEnemy) ? `${Math.round((firstEnemy.enemy.getBoundingClientRect().top - baseGrid.getBoundingClientRect().top))}px` : '0px'
            
            if ( firstEnemy ) {
                firstEnemy.stop()
            }

            setTimeout(() => {
                projectile.remove()
                if ( firstEnemy ) {
                    firstEnemy.kill()
                }
            }, 500)
        }, 100)

        // obliterate(playerPos.x)
    }
}

const spawnEnemy = () => {
    let enemyX = Math.floor(Math.random() * grid.x)

    new Enemy(enemyX, 0)
}

const getFirstEnemy = (axisX) => {
    let enemiesOnAxis = enemiesOnScreen.filter(enemy => {
        if ( enemy.x == axisX ) {
            return enemy
        }
    })

    if ( enemiesOnAxis.length > 0 ) {
        return enemiesOnAxis[(enemiesOnAxis.length-1)]
    }

    return false
}

const endGame = (won = false) => {

    if ( enemyGenerator ) {
        clearInterval(enemyGenerator)
    }

    enemiesOnScreen.forEach(enemy => {
        enemy.stop()
        enemy.kill()
    })

    enemiesOnScreen = []

    if ( won ) {
        let endScreen = document.querySelector(".end-screen")
        let message = document.createElement("h2")
        message.classList.add("message")
        message.innerText = "You did it!"
        
        let scoreText = document.createElement('p')
        scoreText.innerText = `Score: ${score}`
        
        endScreen.innerHTML = ''
        endScreen.appendChild(message)
        endScreen.appendChild(scoreText)

        endScreen.style.display = "flex"

        ipcRenderer.send("submit_score", gameID, score)

        score = 0
    } else {
        let endScreen = document.querySelector(".end-screen")
        let message = document.createElement("h2")
        message.classList.add("message")
        message.innerText = "Game Over!"
        endScreen.innerHTML = ''
        endScreen.appendChild(message)

        endScreen.style.display = "flex"
    }
}

// Enemy Class
class Enemy {
    constructor(x, y) {
        this.x = x
        this.y = y
        this.moveController = null

        this.enemy = document.querySelector(`#grid_${this.x}_${this.y}`)
        this.enemy.classList.add("enemy")

        enemiesOnScreen.push(this)

        this.move()
    }

    move() {
        this.moveController = setInterval(() => {

            if ( this.enemy.classList.contains('enemy') ) {
                if ( this.y < (grid.y - 1)) {
                    this.enemy.classList.remove("enemy")
                    this.enemy = document.querySelector(`#grid_${this.x}_${++this.y}`)
                    this.enemy.classList.add("enemy")
                } else {
                    endGame(false)
                    clearInterval(this.moveController)
                }
            }

        }, enemyMoveSpeed)
    }

    stop() {
        if ( this.moveController ) {
            clearInterval(this.moveController)
            this.moveController = null
        }
    }

    kill() {
        this.enemy.classList.remove("enemy")

        enemiesOnScreen = enemiesOnScreen.filter(item => {
            if ( item != this ) {
                return item
            }
        })

        // highscore addition
        score += (grid.y - this.y)

        if ( lastEnemySpawned && enemiesOnScreen.length == 0 ) {
            endGame(true)
        }
    }
}