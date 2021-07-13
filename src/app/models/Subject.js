const mongoose = require('mongoose')
const slug = require('mongoose-slug-generator')
const Schema = mongoose.Schema

const Subject = new Schema({
    name:String,
    slug: { type: String, slug: 'name', unique: true },
    department:{ type: Schema.Types.ObjectId, ref: 'Department',required: true}

}) 
mongoose.plugin(slug)
module.exports = mongoose.model('Subject',Subject)
