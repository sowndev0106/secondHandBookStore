const mongoose = require('mongoose')
const slug = require('mongoose-slug-generator')
const Schema = mongoose.Schema

const Notification = new Schema({
    type: String,
    chatEnd: { type: Schema.Types.ObjectId, ref: 'Chat', required: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    userSend: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: Number,
}, { timestamps: true })
module.exports = mongoose.model('Notification', Notification)
