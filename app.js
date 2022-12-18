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


let groupPlayers = []
let groups = []

//routes
//show a list of players
app.get('/', async (req,res) => {
    const players = await Player.find({})
    res.render('index',{players, groupPlayers})
})


app.get('/:id/checkin', (req,res) => {
    if(!groupPlayers.includes(req.params.id)){
        groupPlayers.push(req.params.id)
    }
    console.log(groupPlayers)
    res.redirect('/')
})

//generate groups
app.post('/makeGroups', async (req,res) => {
    
    //creates arrays that will contain the groups
    const {numberGroups} = req.body
    console.log(numberGroups)
    for(let i = 1; i<=numberGroups; i++) {
        const group = []
        groups.push(group)
    }
    console.log(groups)
    groups[0].push('test')
    console.log(groups)
    const players = await Player.find({})
    const search = await Promise.all(groupPlayers.map(id => Player.findById(id)))
    search.sort((a,b) => {
        return b.rating - a.rating
    })
    console.log(search)
    res.render('groups',{search})

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