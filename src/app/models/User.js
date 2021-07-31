const mongoose = require('mongoose')
const slug = require('mongoose-slug-generator')
const Schema = mongoose.Schema

const User = new Schema({
    lastName: String,
    avatar: String,
    firstName: String,
    provider: String,
    fakebookID: String,
    googleID: String,
    email: String,
    password: String,

}, { timestamps: true })

module.exports = mongoose.model('User', User)
