const mongoose = require('mongoose')
const basePlayers = require('./basePlayers')
const Player = require('../models/player')



//local db connection
mongoose.connect('mongodb://localhost:27017/eponger')
.then(() => {
    console.log('mongo connection open')
})
.catch(err => {
    console.log('oh noes. Mongo connection problem')
    console.log(err)
})

const seedDB = async () => {
    await Player.deleteMany({})

    for(let basePlayer of basePlayers) {
        const player = new Player({
            firstName: basePlayer.firstName,
            lastName: basePlayer.lastName,
            email: basePlayer.email,
            rating: basePlayer.rating
        })
        await player.save()
    }
}

seedDB().then(() => {
    mongoose.connection.close()
})