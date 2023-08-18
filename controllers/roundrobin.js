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
}

module.exports = GroupGenerator