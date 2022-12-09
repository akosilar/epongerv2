const express = require('express')
const mongoose = require('mongoose')
const methodOverride = require('method-override')
const app = express()
const path = require('path')
const ejsMate = require('ejs-mate')
const player = require('./models/player')
const Player = require('./models/player')
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



//routes
app.get('/', (req,res) => {
    res.render('index')
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