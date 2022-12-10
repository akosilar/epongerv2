const checkIns = document.querySelectorAll('#checkin')

let players = []

for (let checkIn of checkIns) {
    checkIn.addEventListener('click', function(e) {
        // players.push(checkIn.attributes.playerid.value)
        // checkIn.attributes.href.value = '';
        // console.log(players)
    })
}

// module.exports = players