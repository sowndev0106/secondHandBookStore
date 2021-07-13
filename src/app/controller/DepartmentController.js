const Department = require('..//models/Department')
const Post = require('../models/Post')
const Subject = require('..//models/Subject')
const moment = require('moment')
const { mutipleMongooseToObject } = require('..//..//util/mongoose')
class SitesController {
    // [GET] /
    index(req, res, next) {
        Department.find({})
            .then(function (departments) {
                res.json(departments)
            })
    }
    showDepartmentWithSubject(req, res, next) {
        if (req.hasownproperty('subject')) {
            Subject.findOne({ subject: req.subject }).populate('Department')
                .then(function (subject) {
                    res.json(subject)
                })

        }

    }
}
module.exports = new SitesController