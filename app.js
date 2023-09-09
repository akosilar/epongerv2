const express = require('express')
const mongoose = require('mongoose')
const methodOverride = require('method-override')
const app = express()
const path = require('path')
const ejsMate = require('ejs-mate')
const moment = require('moment-timezone')
const Player = require('./models/player')
const Match = require('./models/match')
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
    res.render('index', { search, players, playersCheckedIn, pageName: "players" })
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
    res.render('groups', { groups, groupsRR, pageName: 'groups' })
})

//display matches
app.get('/matches', async (req, res) => {
    const matches = await Match.find({})
        .populate('p1_id', 'firstName lastName')
        .populate('p2_id', 'firstName lastName')
    const players = await Player.find({})

    res.render('matches', { matches, players, pageName: 'matches' })
})

app.get('/scores', async (req, res) => {
    const targetDate = req.query.matchDate ? (new Date(req.query.matchDate)) : new Date((new Date()).setHours(0, 0, 0, 0))
    const matches = await Match.find(targetDate ? {
        matchDate: {
            $gte: targetDate,
            $lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000)
        }
    } : {})
        .populate('p1_id', 'firstName lastName rating')
        .populate('p2_id', 'firstName lastName rating');
    res.render('scores', { matches, targetDate, pageName: 'scores' })
})

app.get('/sheets', (req, res) => {
    res.render('sheets', { groups, pageName: "sheets" })
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


    const { numberGroups, numberPlayers } = req.body
    const search = await Promise.all(playersCheckedIn.map(id => Player.findById(id)))
    search.sort((a, b) => {
        return b.rating - a.rating
    })

    const generator = new GroupGenerator()
    generator.makeGroups(search, numberGroups, numberPlayers, groups = [], groupsRR = [], groupSchedule = [])
    generator.makeRR(groups, groupsRR)

    console.log(groupsRR)
    groupsRR.forEach((group, i) => {
        console.log(`group ${i + 1}:`)
        group.forEach(pair => {
            console.log(`${pair[0].firstName} vs ${pair[1].firstName}`)
        })
    });

    res.redirect('/groups')
})

app.post('/scores', async (req, res) => {
    matchDate = (moment.tz(req.body.matchDate, 'America/New_York').utc().toDate())
    try {
        for (let i = 0; i < groupsRR.length; i++) {
            const group = groupsRR[i];
            for (let j = 0; j < group.length; j++) {
                const pair = group[j];
                const match = new Match({
                    p1_id: pair[0].id,
                    p2_id: pair[1].id,
                    group: i + 1,
                    matchDate: (matchDate)
                });
                await match.save();
            }
        }
        res.redirect(`/scores?matchDate=${matchDate}`);
    } catch (error) {
        console.error('Error saving matches:', error);
        // Handle the error appropriately
        res.status(500).send('Error saving matches');
    }
});



// app.post('/scores', async (req, res) => {
//     console.log(req.body.matchDate)
//     groupsRR.forEach((group, i) => {
//         group.forEach(pair => {
//             const match = new Match({
//                 p1_id: pair[0].id,
//                 p2_id: pair[1].id,
//                 group: i + 1,
//                 matchDate: req.body.matchDate

//             })
//             await match.save()

//         })
//     })
//     res.redirect('/groups')
// })

app.post('/addMatch', async (req, res) => {
    const match = new Match(req.body.match)
    console.log(match)
    await match.save()
    res.redirect('/matches')
})

//add new player
app.post('/', async (req, res) => {
    const player = new Player(req.body.player)
    await player.save()
    res.redirect('/')
})

app.delete('/matches/:id', async (req, res) => {
    const { id } = req.params
    await Match.findByIdAndDelete(id)
    res.redirect('/matches')
})

app.delete('/:id', async (req, res) => {
    const { id } = req.params
    await Player.findByIdAndDelete(id)
    res.redirect('/')
})

app.listen(3000, () => {
    console.log('listening on port 3000')
})