const { model } = require("mongoose");

module.exports = function (req, res, next) {
    // default
    res.locals.soft = {
        enabled: false,
        type: 'desc',
        column: 'createdAt',
    }
    if (req.query.hasOwnProperty('soft')) {
        res.locals.soft.enabled = true
        res.locals.soft.column = req.query.soft;
        res.locals.soft.type = req.query.type;
        // kiem tra co dung dinh dang khong
        const isValidtype = ['asc', 'desc'].includes(req.query.type)
        res.locals.soft.type = isValidtype ? req.query.type : 'desc';
    }
    next()
}