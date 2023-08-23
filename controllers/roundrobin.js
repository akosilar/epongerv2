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
        // if (groupLength == 3) {
        //     // console.log(`1vs4: ${group[2][0].firstName} vs ${group[2][1].firstName}`)
        //     // console.log(`2vs3: ${group[3][0].firstName} vs ${group[3][1].firstName}`)
        //     for (let i = 3; i > 0; i--) {
        //         groupSchedule[groupNum].push(group[i - 1])
        //         //print pairing
        //         // console.log(`${group[i - 1][0].firstName} vs ${group[i - 1][1].firstName}`)
        //     }
        // }

        if (groupLength % 2 == 0) {

            this.top = []
            this.bottom = []

            const middleIndex = group.length / 2;

            console.log('from schedulerr function')
            // console.log(group)

            this.top = group.slice(0, middleIndex)
            this.bottom = group.slice(middleIndex).reverse()

            for (let i = 0; i < group.length - 1; i++) {

            }

            for (let i = 0; i < groupLength - 1; i++) {
                for (let i = 0; i < middleIndex; i++) {
                    console.log(`${this.top[i].firstName} vs ${this.bottom[i].firstName}`)
                }
                // console.log(`${this.top[0].firstName} vs ${this.bottom[0].firstName}`)
                // console.log(`${this.top[1].firstName} vs ${this.bottom[1].firstName}`)
                this.bottom.push(this.top.pop())
                // console.log(this.bottom)
                this.top.splice(1, 0, (this.bottom.shift()))
                // console.log(this.top)
            }
        }
    }

    makeRR(groups, groupsRR) {
        console.log(`Number of groups: ${groups.length}`)
        console.log(`groupsrr length: ${groupsRR.length} groupsrr: ${groupsRR}`)
        for (let i = 0; i < groups.length; i++) {
            console.log(`group ${i + 1}:`)
            this.scheduleRR(groups[i], groups[i].length, i)
            for (let j = 0; j < groups[i].length; j++) {
                for (let k = j; k < groups[i].length - 1; k++) {
                    const pair = [groups[i][j], groups[i][k + 1]] //contains the RR pair
                    groupsRR[i].push(pair) // store the RR pair to the main groups array
                    // console.log(`${groupsRR[i][k][0].firstName} vs ${groupsRR[i][k][1].firstName}`)
                    // console.log(`${groups[i][j].firstName} vs ${groups[i][k + 1].firstName}`)
                }
            }
            // this.scheduleRR(groupsRR[i], groups[i].length, i)
        }

    }




}

module.exports = GroupGenerator