const mongoose = require('mongoose')
const slug = require('mongoose-slug-generator')
const Schema = mongoose.Schema

const User = new Schema({
    lastName:String,
    firstName:String,
    userID:String,
    email:String,
    password:String,
    
}, { timestamps: true }) 

module.exports = mongoose.model('User',User)
