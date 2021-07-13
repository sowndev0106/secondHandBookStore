const express = require('express')
const router = express.Router()
const me = require('..//app/controller/MeController')
const softMiddlerwarse = require('..//app/middlewarses/SoftMiddlewarse')

router.get('/posted', softMiddlerwarse, me.posted)
router.get('/deleted', softMiddlerwarse, me.deleted)
module.exports = router