const express = require('express')
const mongoose = require('mongoose')
const methodOverride = require('method-override')
const app = express()
const path = require('path')
const ejsMate = require('ejs-mate')
const Player = require('./models/player')
// const groupPlayers = require('./public/group')
const { func } = require('joi')
const { group } = require('console')
const player = require('./models/player')
// const catchAsync = require('./utils/catchAsync')
// const ExpressError = require('./utils/ExpressError')

const GroupGenerator = require('./controllers/roundrobin')

//local db connection
mongoose.connect('mongodb://localhost:27017/eponger')
    .then(() => {
        console.log('mongo connection open')
    })
    .catch(err => {
        console.log('oh noes. Mongo connection problem')
        console.log(err)
    })


//middleware
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.use(methodOverride('_method')) //for routes other than get and post
app.engine('ejs', ejsMate)
app.use(express.static('public'))


let playersCheckedIn = [] //contains checked in players
let groups = [] //contains groups of checked in players
let groupsRR = [] //contains groups of every pair
let groupSchedule = [] //contains groups of every pair sorted by schedule depending on player count per group

//


//routes
//show a list of players
app.get('/', async (req, res) => {
    const players = await Player.find({})
    // const players = await Player.find({})
    const search = await Promise.all(playersCheckedIn.map(id => Player.findById(id)))
    //sort the players by rating (highest to lowest)
    search.sort((a, b) => {
        return b.rating - a.rating
    })
    res.render('index', { search, players, playersCheckedIn })
})

app.get('/checkedin', async (req, res) => {
    // const players = await Player.find({})
    const search = await Promise.all(playersCheckedIn.map(id => Player.findById(id)))
    //sort the players by rating (highest to lowest)
    search.sort((a, b) => {
        return b.rating - a.rating
    })
    res.render('checkedin', { search, playersCheckedIn })
})

app.get('/groups', async (req, res) => {
    // const search = await Promise.all(groups.map(group => Promise.all(group.map(id => Player.findById(id)))))
    // console.log(groups)
    res.render('groups', { groups, groupSchedule })
})

app.get('/sheets', (req, res) => {
    res.render('sheets', { groups })
})

//check in player which adds the player to playersCheckedIn
app.get('/:id/checkin', (req, res) => {
    if (!playersCheckedIn.includes(req.params.id)) {
        playersCheckedIn.push(req.params.id)
    }
    console.log(playersCheckedIn)
    res.redirect('/')
})

//remove player from playersCheckedIn
app.get('/:id/remove', async (req, res) => {
    if (playersCheckedIn.includes(req.params.id)) {
        playersCheckedIn.splice(playersCheckedIn.indexOf(req.params.id), 1)
    }
    console.log(playersCheckedIn)
    res.redirect('/')

})

//generate groups
app.post('/makeGroups', async (req, res) => {
    groups = [] //re-initialize groups
    groupsRR = []
    groupSchedule = []
    const { numberGroups, numberPlayers } = req.body
    console.log('number of groups: ' + numberGroups)
    console.log('number of players per group: ' + numberPlayers)
    const search = await Promise.all(playersCheckedIn.map(id => Player.findById(id)))
    search.sort((a, b) => {
        return b.rating - a.rating
    })

    const generator = new GroupGenerator()
    generator.makeGroups(search, numberGroups, numberPlayers)

    for (let i = 1; i <= numberGroups; i++) {
        const group = [] //create an empty array that will hold the group of players
        search.slice(0, numberPlayers).map(el => group.push(el)) //push the first numberPlayers into the empty group array
        search.splice(0, group.length) //remove the recently added players from groupPlayers
        groups.push(group) //add the group of players
        groupsRR.push([]); // Initialize an empty array for each group
        groupSchedule.push([]) //Initialize an empty array for each group

    }


    //RR schedule

    const scheduleRR = (group, groupLength, groupNum) => {
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

    //generate round robin
    const makeRR = (groups) => {
        console.log(`Number of groups: ${groups.length}`)
        console.log(`groupsrr length: ${groupsRR.length} groupsrr: ${groupsRR}`)
        for (let i = 0; i < groups.length; i++) {
            console.log(`group ${i + 1}:`)
            for (let j = 0; j < groups[i].length; j++) {
                for (let k = j; k < groups[i].length - 1; k++) {
                    const pair = [groups[i][j], groups[i][k + 1]] //contains the RR pair
                    groupsRR[i].push(pair) // store the RR pair to the main groups array
                    // console.log(`${groupsRR[i][k][0].firstName} vs ${groupsRR[i][k][1].firstName}`)
                    // console.log(`${groups[i][j].firstName} vs ${groups[i][k + 1].firstName}`)
                }
            }
            scheduleRR(groupsRR[i], groups[i].length, i)
        }

    }
    makeRR(groups)

    //iterate over groupSchedule to produce pairings in order to avoid conflicts on the table
    // groupSchedule.forEach(group => {
    //     group.forEach(pair => {
    //         console.log(`${pair[0].firstName} vs ${pair[1].firstName}`)
    //     })
    // })
    res.redirect('/groups')
})



//add new player
app.post('/', async (req, res) => {
    const player = new Player(req.body.player)
    await player.save()
    res.redirect('/')
})

app.delete('/:id', async (req, res) => {
    const { id } = req.params
    await Player.findByIdAndDelete(id)
    res.redirect('/')
})

app.listen(3000, () => {
    console.log('listening on port 3000')
})