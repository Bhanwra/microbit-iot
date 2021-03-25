const { ipcRenderer } = require('electron')

require('./common')


window.addEventListener('DOMContentLoaded', () => {

    let gameID = (window.process.argv[window.process.argv.length-1])
    gameID = gameID.substr(gameID.indexOf('=')+1)

    console.log(gameID)

    ipcRenderer.send('get_leaderboards', Number(gameID))

    ipcRenderer.on('received_leaderboards', (event, score) => {
        console.log(score)
        document.getElementById('leaderboards').innerHTML = `
            ${score.highScore.player} : ${score.highScore.score}
        `
    })

})