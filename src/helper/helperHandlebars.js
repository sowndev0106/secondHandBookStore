const handlebars = require('handlebars')
const moment = require("moment");

module.exports = {
    dropText: function (a, number1, number2) {
        if (a == undefined)
            return ''
        var length = a.split(' ').length
        if (a.length > number2) {
            a = a.slice(0, number2);
        } else {
            if (length > number1) {
                a = a.split(' ').splice(0, number1).join(' ');
                a += " ..."
            } else {
                if (a.length < (number2 / 2)) {
                    a += '<br> <br>'
                }
            }
        }
        return a
    },
    dropTextChar: function (txt, number) {
        if (txt == undefined)
            return ''
        if (txt.length > number + 3) {
            txt = txt.slice(0, number) + ' ...';
        }
        return txt
    },
    selected: function (a, b) {
        return a == b ? 'selected' : ''
    },
    addOne: (a, b) => { return a + b },
    disabled: (a) => { return a ? '' : 'disabled' },
    softHelper: function (column, soft) {

        var softType = column === soft.column ? soft.type : 'default'
        var icons = {
            default: 'fad fa-sort',
            asc: 'fal fa-sort-amount-up-alt',
            desc: 'fal fa-sort-amount-down-alt'
        }
        var type = {
            default: 'desc',
            asc: 'desc',
            desc: 'asc'
        }
        var text
        if (column == 'createdAt') {
            text = 'Thời gian tạo'
        } else if ((column == 'price')) {
            text = 'Giá'
        } else {
            text = 'Tên'
        }
        const addresses = handlebars.escapeExpression(`?soft=${column}&type=${type[soft.type]}`)
        var output = `<a href=" ${addresses}" 
                class=" btn border " >  ${text}
                 <i class="${icons[softType]} text-primary"></i>
              </a>`
        return new handlebars.SafeString(output);
    },
    active: (a, b) => { return a == b ? 'active' : '' },
    fomartMoney: function (money) {
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
    equalsText: (txt1, txt2, success, fail) => {
        console.log(txt1)
        console.log(txt2)
        if (txt1 == txt2) {
            return success
        }
        return fail
    }
    ,
    avatarDefault: (href) => {
        if (href == undefined || href == '') {
            return '/images/user5.png'
        }
        return href
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