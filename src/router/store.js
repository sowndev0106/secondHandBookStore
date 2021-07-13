const express = require('express')
const router = express.Router()

const softMiddlerwarse = require('..//app/middlewarses/SoftMiddlewarse')

// khoi tao controller
const storeController = require('../app/controller/StoreController')
router.get('/search-complete', storeController.searchComplete)
router.get('/:department', softMiddlerwarse, storeController.withDepartment)
router.get('/', softMiddlerwarse, storeController.index)

module.exports = router