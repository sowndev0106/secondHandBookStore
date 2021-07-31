const express = require('express')
const router = express.Router()
const me = require('..//app/controller/MeController')
router.get('/me/getNotification', me.getNotification)
module.exports = router