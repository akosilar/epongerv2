const mongoose = require('mongoose')
const Schema = mongoose.Schema

const PlayerSchema = new Schema({
    firstName: String,
    lastName: String,
    email: String,
    rating: Number
})

module.exports = mongoose.model('Player', PlayerSchema)