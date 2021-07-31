const moment = require("moment");

module.exports = {
    englishAlphabetLowercased: function (str) {
        return str.normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase()
    },
    money: function (money) {
        var formatter = new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        });
        try {
            return formatter.format(money)
        } catch (error) {
            return 0
        }
    },
    timeAgo: function (time) {
        moment.locale("vi");
        try {
            return moment(new Date(time)).fromNow()
        } catch (error) {
            return 0
        }
    },
    timeHours: function (time) {
        moment.locale("es");
        try {
            return moment(new Date(time)).format("h:mm A")
        } catch (error) {
            return 0
        }
    }
}