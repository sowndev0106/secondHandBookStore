const express = require('express')
const router = express.Router()

// khoi tao controller
const departmentController  = require('../app/controller/DepartmentController')
router.get('/',departmentController.index)
module.exports =  router