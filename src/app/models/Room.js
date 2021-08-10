const mongoose = require('mongoose')
const slug = require('mongoose-slug-generator')
const Schema = mongoose.Schema

const Room = new Schema({
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    userReceive: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    chatEnd: { type: Schema.Types.ObjectId, ref: 'Chat' },
    missMessage: Number
}, { timestamps: true })
module.exports = mongoose.model('Room', Room)
