const express = require('express')
const router = express.Router()
const me = require('..//app/controller/MeController')
const softMiddlerwarse = require('..//app/middlewarses/SoftMiddlewarse')

router.get('/posted', softMiddlerwarse, me.posted)
router.get('/deleted', softMiddlerwarse, me.deleted)
router.get('/chat/:userID', softMiddlerwarse, me.chat)
router.get('/chat', softMiddlerwarse, me.chat)
router.get('/getNotification', softMiddlerwarse, me.getNotification)
router.get('/getMessages/:userID', softMiddlerwarse, me.getMessages)
router.get('/getMessages', softMiddlerwarse, me.getMessages)

module.exports = router