const mongoose = require('mongoose')
const slug = require('mongoose-slug-generator')
const Schema = mongoose.Schema

const Room = new Schema({
    member: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    chatEnd: { type: Schema.Types.ObjectId, ref: 'Chat' },
    miss: Number
}, { timestamps: true })

module.exports = mongoose.model('Room', Room)
