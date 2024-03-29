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

const GroupGenerator = require('./public/roundrobin')
const Rating = require('./public/rating')

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
    res.render('checkedin', { search, playersCheckedIn, pageName: "checkedin" })
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
    matches.sort((a, b) => {
        return b.matchDate - a.matchDate
    })
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


    function areAllScoresPopulated(matches) {
        // Check if all matches have p1_score and p2_score populated
        for (const match of matches) {
            if (!(match.p1_score) || !(match.p2_score)) {
                return false; // At least one match is missing scores
            }
        }
        return true; // All matches have p1_score and p2_score populated
    }


    res.render('scores', { matches, targetDate, pageName: 'scores', areAllScoresPopulated })
})

app.get('/sheets', (req, res) => {
    res.render('sheets', { groups, pageName: "sheets" })
})

//check in player which adds the player to playersCheckedIn
app.get('/:id/checkin', (req, res) => {
    if (!playersCheckedIn.includes(req.params.id)) {
        playersCheckedIn.push(req.params.id)
    }
    // console.log(playersCheckedIn)
    res.redirect('/')
})

//remove player from playersCheckedIn
app.get('/:id/remove', async (req, res) => {
    if (playersCheckedIn.includes(req.params.id)) {
        playersCheckedIn.splice(playersCheckedIn.indexOf(req.params.id), 1)
    }
    // console.log(playersCheckedIn)
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

    // console.log(groupsRR)
    // groupsRR.forEach((group, i) => {
    //     console.log(`group ${i + 1}:`)
    //     group.forEach(pair => {
    //         console.log(`${pair[0].firstName} vs ${pair[1].firstName}`)
    //     })
    // });

    res.redirect('/groups')
})

app.post('/scores', async (req, res) => {
    const { match } = req.body

    for (const matchId in match) {
        if (match.hasOwnProperty(matchId)) {
            const { p1_score, p2_score } = match[matchId];

            // Update the Match document in the database with the new scores
            const result = await Match.findByIdAndUpdate(matchId, { p1_score, p2_score }).populate('p1_id', 'rating').populate('p2_id', 'rating');

            //store rating change into match document if scores are populated, and update player rating
            if (p1_score && p2_score) {
                const rating = new Rating(p1_score, p2_score, result.p1_id.rating, result.p2_id.rating)
                result.p1_rating_change = rating.calculateRating()[0];
                // const p1 = await Player.findByIdAndUpdate(result.p1_id, { rating: result.p1_id.rating += result.p1_rating_change })

                result.p2_rating_change = rating.calculateRating()[1];
                // const p2 = await Player.findByIdAndUpdate(result.p2_id, { rating: result.p2_id.rating += result.p2_rating_change })

                // p1.save()
                // p2.save()
            } else {
                //clear rating changes
                result.p1_rating_change = ''
                result.p2_rating_change = ''
            }


            result.save();

        }
    }
    //acquire the first match, and pass the matchDate on the redirect
    const firstMatch = await Match.findById(Object.keys(match)[0]).populate('p1_id', 'rating').populate('p2_id', 'rating')

    res.redirect(`/scores?matchDate=${firstMatch.matchDate}`);

});



app.post('/inputMatches', async (req, res) => {


    try {
        for (let i = 0; i < groupsRR.length; i++) {
            const group = groupsRR[i];

            for (const pair of group) {
                const match = new Match({
                    p1_id: pair[0].id,
                    p2_id: pair[1].id,
                    group: i + 1,
                    matchDate: moment.tz(req.body.matchDate, 'America/New_York').utc().toDate()
                });

                await match.save();
            }
        }

        res.redirect(`/scores?matchDate=${req.body.matchDate}`);
    } catch (error) {
        // Handle errors here, e.g., log the error and send an error response
        console.error(error);
        res.status(500).send('An error occurred while saving matches.');
    }
});




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