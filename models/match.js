const { date } = require('joi')
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const MatchSchema = new Schema({
    p1_score: String,
    p2_score: String,
    p1_id: {
        type: Schema.Types.ObjectId,
        ref: 'Player'
    },
    p2_id: {
        type: Schema.Types.ObjectId,
        ref: 'Player'
    },
    group: Number,
    matchDate: Date
})

module.exports = mongoose.model('Match', MatchSchema)