const mongoose = require('mongoose')
const slug = require('mongoose-slug-generator')
const mongoosePaginate = require('mongoose-paginate-v2');

const Schema = mongoose.Schema


const Department = new Schema({
    name: String,
    slug: { type: String, slug: 'name', unique: true }
})
mongoose.plugin(slug)
module.exports = mongoose.model('Department', Department)