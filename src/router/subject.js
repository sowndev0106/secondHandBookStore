const express = require('express')
const router = express.Router()

// khoi tao controller
const subjectController  = require('../app/controller/SubjectController')
router.get('/',subjectController.index)
module.exports =  router