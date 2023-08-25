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
        }

    }

    scheduleRR(group) {
        this.top = []
        this.bottom = []
        const groupRR = []
        const bye = {
            firstName: "bye"
        }

        if (group.length % 2 != 0) {
            group.push(bye)
        }
        const middleIndex = group.length / 2;


        this.top = group.slice(0, middleIndex)
        this.bottom = group.slice(middleIndex).reverse()
        for (let i = 0; i < group.length - 1; i++) {
            for (let j = 0; j < middleIndex; j++) {
                const pair = (this.top[j].firstName == "bye" || this.bottom[j].firstName == "bye") ? ["bye"] : [this.top[j], this.bottom[j]]
                pair != "bye" ? groupRR.push(pair) : ''
            }

            this.bottom.push(this.top.pop())
            this.top.splice(1, 0, (this.bottom.shift()))

        }
        return groupRR
    }

    makeRR(groups, groupsRR) {
        console.log(`Number of groups: ${groups.length}`)
        console.log(`groupsrr length: ${groupsRR.length} groupsrr: ${groupsRR}`)
        for (let i = 0; i < groups.length; i++) {
            groupsRR.push(this.scheduleRR(groups[i], groups[i].length, i))
            // for (let j = 0; j < groups[i].length; j++) {
            //     for (let k = j; k < groups[i].length - 1; k++) {
            //         const pair = [groups[i][j], groups[i][k + 1]] //contains the RR pair
            //         groupsRR[i].push(pair) // store the RR pair to the main groups array
            //         // console.log(`${groupsRR[i][k][0].firstName} vs ${groupsRR[i][k][1].firstName}`)
            //         // console.log(`${groups[i][j].firstName} vs ${groups[i][k + 1].firstName}`)
            //     }
            // }
            // this.scheduleRR(groupsRR[i], groups[i].length, i)
        }
        // console.log(groupsRR)
        // groupsRR.forEach((group, i) => {
        //     console.log(`group ${i + 1}:`)
        //     group.forEach(pair => {
        //         console.log(`${pair[0].firstName} vs ${pair[1].firstName}`)
        //     })
        // });

    }




}

module.exports = GroupGenerator