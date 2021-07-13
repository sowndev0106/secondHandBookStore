const Department = require('..//models/Department')
const Post = require('../models/Post')
const Subject = require('..//models/Subject')
const moment = require('moment')
const { mutipleMongooseToObject } = require('..//..//util/mongoose')
class SitesController {
    // [GET] /
    index(req, res, next) {  
        Subject.find({})
            .then(function (Subject) {
                res.json(Subject)
            }) 
    }
    showSubjectsWithDepartment(req, res, next) {  
        if(req.hasownproperty('department')){
            Subject.find({department:req.department})
            .then(function(subject){
                res.json(subject)
            })
        }else{
            res.json('false')
        }
    }
}
module.exports = new SitesController