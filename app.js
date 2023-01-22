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

//routes
//show a list of players
app.get('/', async (req,res) => {
    const players = await Player.find({})
    res.render('index',{players, playersCheckedIn})
})

app.get('/checkedin', async (req,res) => {
    // const players = await Player.find({})
    const search = await Promise.all(playersCheckedIn.map(id => Player.findById(id)))
    //sort the players by rating (highest to lowest)
    search.sort((a,b) => {
        return b.rating - a.rating
    })
    res.render('checkedin',{search, playersCheckedIn})
})

app.get('/groups', async(req,res) => {
    // const search = await Promise.all(groups.map(group => Promise.all(group.map(id => Player.findById(id)))))
    console.log(groups)
    res.render('groups', {groups})
})


//check in player which adds the player to playersCheckedIn
app.get('/:id/checkin', (req,res) => {
    if(!playersCheckedIn.includes(req.params.id)){
        playersCheckedIn.push(req.params.id)
    }
    console.log(playersCheckedIn)
    res.redirect('/')
})

//remove player from playersCheckedIn
app.get('/:id/remove', async (req,res) => {
    if(playersCheckedIn.includes(req.params.id)){
        playersCheckedIn.splice(playersCheckedIn.indexOf(req.params.id),1)
    }
    console.log(playersCheckedIn)
    res.redirect('/checkedin')

})

//generate groups
app.post('/makeGroups', async (req,res) => {
    groups = [] //re-initialize groups
    const {numberGroups,numberPlayers} = req.body
    console.log('number of groups: ' + numberGroups)
    console.log('number of players per group: ' + numberPlayers)
    const search = await Promise.all(playersCheckedIn.map(id => Player.findById(id)))
    search.sort((a,b) => {
        return b.rating - a.rating
    })
    // const pc = search.map(el => el) // create a copy of checked in players.
    for(let i = 1; i<=numberGroups; i++) {
        const group = [] //create an empty array that will hold the group of players
        search.slice(0,numberPlayers).map(el=>group.push(el)) //push the first numberPlayers into the empty group array
        search.splice(0,group.length) //remove the recently added players from groupPlayers
        groups.push(group) //add the group
    }

    res.redirect('/groups')
})



//add new player
app.post('/', async(req,res) => {
    const player = new Player(req.body.player)
    await player.save()
    res.redirect('/')
})

app.listen(3000, () => {
    console.log('listening on port 3000')
})