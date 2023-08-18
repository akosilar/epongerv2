class GroupGenerator {
    constructor() {
    }

    makeGroups(players, numGroups, numPlayers, groups, groupsRR, groupSchedule) {
        console.log('this came from the class')


        for (let i = 1; i <= numGroups; i++) {
            const group = [] //create an empty array that will hold the group of players
            players.slice(0, numPlayers).map(el => group.push(el)) //push the first numberPlayers into the empty group array
            players.splice(0, group.length) //remove the recently added players from groupPlayers
            groups.push(group) //add the group of players
            groupsRR.push([]); // Initialize an empty array for each group
            groupSchedule.push([]) //Initialize an empty array for each group

        }

    }

    scheduleRR(group, groupLength, groupNum) {
        //if group has 3 players
        if (groupLength == 3) {
            // console.log(`1vs4: ${group[2][0].firstName} vs ${group[2][1].firstName}`)
            // console.log(`2vs3: ${group[3][0].firstName} vs ${group[3][1].firstName}`)
            for (let i = 3; i > 0; i--) {
                groupSchedule[groupNum].push(group[i - 1])
                //print pairing
                // console.log(`${group[i - 1][0].firstName} vs ${group[i - 1][1].firstName}`)
            }
        }
    }
}

module.exports = GroupGenerator