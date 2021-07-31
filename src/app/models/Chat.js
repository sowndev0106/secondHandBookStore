const mongoose = require('mongoose')
const slug = require('mongoose-slug-generator')
const mongoosePaginate = require('mongoose-paginate-v2')
const Schema = mongoose.Schema

const Chat = new Schema({
    userSend: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    userReceive: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    room: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
    message: String,
    status: { type: Boolean, default: false }
}, { timestamps: true })
Chat.plugin(mongoosePaginate);
module.exports = mongoose.model('Chat', Chat)
