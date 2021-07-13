const Post = require("../models/Post");
const moment = require("moment");
const { mutipleMongooseToObject } = require("..//..//util/mongoose");
const { Exception } = require("handlebars");
const pagination_soft_soption = require('..//..//util/pagination_soft_option')
const limit = 10

class Mecontroller {
  // [GET] /me/posted
  posted(req, res, next) {
    var user = req.cookies.userID;
    if (!user) {
      res.redirect("back");
    }
    var paginatoin_soft = pagination_soft_soption.paginatoin_soft(req, res, limit)
    var page = paginatoin_soft.page
    var params = paginatoin_soft.params

    Promise.all([Post.paginate({ owner: user, deleted: false }, paginatoin_soft.option), Post.countDeleted({ owner: user }), Post.count({ owner: user })])
      .then(([result, deletedCount, count]) => {
        var posts = result.docs
        moment.locale("vi"); // cau hinh tieng viet
        for (var i = 0; i < posts.length; i++) {
          posts[i].timeAgo = moment(new Date(posts[i].createdAt)).fromNow();
          posts[i].images = posts[i].images[0];
        }
        var pagination_href = pagination_soft_soption.pagination_href(params, result.totalPages, page)
        res.render("me/posted", {
          posts: mutipleMongooseToObject(posts),
          deletedCount,
          result,
          count,
          linkNext: pagination_href.linkNext,
          linkPrev: pagination_href.linkPrev,
          hasPrevPage: result.hasPrevPage,
          hasNextPage: result.hasNextPage,
          href: pagination_href.href
        });
      })
      .catch(function (err) {
        console.log(err)
        res.redirect("back");
      });
  }
  // [GET] /me/deleted
  deleted(req, res, next) {
    var user = req.cookies.userID;
    if (!user) {
      res.redirect("back");
    }
    var paginatoin_soft = pagination_soft_soption.paginatoin_soft(req, res, limit)
    var page = paginatoin_soft.page
    var params = paginatoin_soft.params
    var option = paginatoin_soft.option

    Promise.all([Post.paginate({ deleted: true }, option), Post.countDeleted({ owner: user })])
      .then(([result, deletedCount]) => {
        var posts = result.docs
        moment.locale("vi"); // cau hinh tieng viet
        for (var i = 0; i < posts.length; i++) {
          posts[i].timeAgo = moment(new Date(posts[i].createdAt)).fromNow();
          posts[i].images = posts[i].images[0];
        }
        var pagination_href = pagination_soft_soption.pagination_href(params, result.totalPages, page)
        res.render("me/deleted", {
          posts: mutipleMongooseToObject(posts),
          deletedCount,
          result,
          linkNext: pagination_href.linkNext,
          linkPrev: pagination_href.linkPrev,
          hasPrevPage: result.hasPrevPage,
          hasNextPage: result.hasNextPage,
          href: pagination_href.href
        });
      })
      .catch(function (err) {
        console.log(err)
        res.redirect("back");
      });
  }
}
module.exports = new Mecontroller();
