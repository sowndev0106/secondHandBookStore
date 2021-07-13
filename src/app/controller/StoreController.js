const Department = require('..//models/Department')
const Post = require('../models/Post')
const Subject = require('..//models/Subject')
const moment = require('moment')
const { mutipleMongooseToObject } = require('..//..//util/mongoose')
const { mongooseToObject } = require('..//..//util/mongoose')
const option_pagination_soft = require('..//..//util/pagination_soft_option')
const convertText = require('..//..//util/convertText')
var limit = 20
class StoreController {
    // [GET] /store
    index(req, res, next) {
        var pagination = option_pagination_soft.paginatoin_soft(req, res, limit)
        var page = pagination.page
        var params = pagination.params
        var options = pagination.option
        options.populate = ([{ path: 'department' }, { path: 'owner' }]);
        var query = { deleted: false }
        if (req.query.q) {
            var search = new RegExp(convertText.englishAlphabetLowercased((req.query.q)))
            query = { deleted: false, englishAlphabetLowercased: search }
        }
        Promise.all([Post.paginate(query, options), Department.find({})])
            .then(([result, departments]) => {
                var pagination_href = option_pagination_soft.pagination_href(params, result.totalPages, page)

                moment.locale("vi"); // cau hinh tieng viet
                var posts = result.docs
                for (var i = 0; i < posts.length; i++) {
                    posts[i].timeAgo = moment(new Date(posts[i].createdAt)).fromNow();
                    posts[i].images = posts[i].images[0];
                }
                res.render('store/store', {
                    posts: mutipleMongooseToObject(posts),
                    departments: mutipleMongooseToObject(departments),
                    linkNext: pagination_href.linkNext,
                    linkPrev: pagination_href.linkPrev,
                    hasPrevPage: result.hasPrevPage,
                    hasNextPage: result.hasNextPage,
                    href: pagination_href.href,
                    activeDepartment: 'bg-info text-white',
                    search: req.query.q
                })
            })

    }
    // [GET] /store/:department
    withDepartment(req, res, next) {
        var pagination = option_pagination_soft.paginatoin_soft(req, res, limit)
        var page = pagination.page
        var params = pagination.params
        var options = pagination.option
        var slug = req.params.department
        options.populate = ([{
            path: 'subject',
            populate: { path: 'department', match: { slug: 'cong-nghe-thong-tin' } }

        }, { path: 'owner' }]);
        Department.findOne({ slug: slug })
            .then(function (department) {
                var query = { deleted: false, department: department._id }
                return Promise.all([Post.paginate(query, options), Department.find({})])
            })
            .then(([result, departments]) => {
                var pagination_href = option_pagination_soft.pagination_href(params, result.totalPages, page)

                moment.locale("vi"); // cau hinh tieng viet
                var posts = result.docs
                for (var i = 0; i < posts.length; i++) {
                    posts[i].timeAgo = moment(new Date(posts[i].createdAt)).fromNow();
                    posts[i].images = posts[i].images[0];
                }
                res.render('store/store', {
                    posts: mutipleMongooseToObject(posts),
                    departments: mutipleMongooseToObject(departments),
                    linkNext: pagination_href.linkNext,
                    linkPrev: pagination_href.linkPrev,
                    hasPrevPage: result.hasPrevPage,
                    hasNextPage: result.hasNextPage,
                    href: pagination_href.href,
                    departmentActive: slug
                })
            })
    }
    // [GET] /store/autocomplate?v=
    searchComplete(req, res, next) {
        // convertText(req.query.q) : Chuyển thành chữ không dấu và viết thường
        var search = new RegExp(convertText.englishAlphabetLowercased((req.query.q)))
        Post.
            aggregate(
                [{ "$match": { englishAlphabetLowercased: search } },
                { "$group": { "_id": "$englishAlphabetLowercased" } },
                { "$limit": 10 }
                ])
            .then(posts => {
                console.log(posts)
                res.json(posts)
            })

    }
}
module.exports = new StoreController