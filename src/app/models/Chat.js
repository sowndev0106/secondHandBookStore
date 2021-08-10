const mongoose = require('mongoose')
const slug = require('mongoose-slug-generator')
const mongoosePaginate = require('mongoose-paginate-v2')
const Schema = mongoose.Schema

const Chat = new Schema({
    member: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    roomReceive: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
    roomSend: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
    message: String,
    status: { type: Boolean, default: false }
}, { timestamps: true })
Chat.plugin(mongoosePaginate);
module.exports = mongoose.model('Chat', Chat)
