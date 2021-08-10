const Post = require("../models/Post");
const moment = require("moment");
const { mutipleMongooseToObject, mongooseToObject } = require("..//..//util/mongoose");
const { Exception } = require("handlebars");
const pagination_soft_soption = require('..//..//util/pagination_soft_option');
const User = require("../models/User");
const Room = require("../models/Room");
const Chat = require("../models/Chat");
const Notification = require("../models/Notification");
const limit = 10

class Mecontroller {
  // [GET] /me/posted
  posted(req, res, next) {
    var user = req.user._id;

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
    var user = req.user._id;
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
  async chat(req, res, next) {
    res.render('me/chat')
    var userMain = req.user._id
    var userReceive = req.params.userID
    if (userReceive && userReceive != userMain) {
      var room = await Room.findOne({ owner: userMain, userReceive: userReceive })
      if (!room) {
        room = new Room({ owner: userMain, userReceive: userReceive })
        room.save()
      }
      // res.render('me/chat', { room: room })
      return
    }
  }
  // [GET] /me/getMessages
  async getMessages(req, res) {
    if (!req.user) {
      res.status(400).send('login required')
      return
    }
    var limitChat = 10
    var pagination_soption = pagination_soft_soption.paginatoin_soft(req, res, limitChat)
    var userMain = req.user._id
    var userReceive = req.params.userID
    var option = pagination_soption.option
    option.populate = ([{
      path: 'User',
      populate: 'userSend'
    }]);
    if (userReceive == undefined || userMain == userReceive) {
      res.status(417)
      return
    }
    var room = await Room.findOneAndUpdate({ owner: userMain, userReceive: userReceive }, { missMessage: 0 })
    if (!room) {
      console.log('k tim thay uer')
      res.status(400).send('user no constants')
      return
    }
    Chat.paginate({ $or: [{ 'roomReceive': room._id }, { 'roomSend': room._id }] }, option)
      .then(function (chats) {
        res.json({
          chats: chats,
          userID: userMain,
          userReceive: userReceive
        })

        Chat.updateMany({ $or: [{ roomReceive: room._id }, { roomSend: room._id }], member: userReceive }, { status: true })
          .then()
        // delete notificartion
        Notification.deleteOne({ owner: userMain, userSend: userReceive }, function (err) { })
      })
      // find room userMain and userSecond 
      .catch(function (err) {
        console.log(err)
        res.status(500)
      })
  }
  // [GET] /me/getroom
  getRooms(req, res) {
    console.time("answer time");
    if (!req.user) {
      res.status(404).send('Chua dang nhap')
      return
    }
    var userMain = req.user._id
    Room.find({ owner: userMain }).sort({ 'updatedAt': 'desc' }).populate('userReceive').populate('chatEnd')
      .then(function (rooms) {
        if (rooms.length == 0) {
          res.status(204).send('user have\'t room')
          return
        }
        res.json({
          rooms
        })
        console.timeEnd("answer time");
      })
      .catch(function (err) {
        res.status(500)
      })
  }
  // [GET] /me/getNotification
  getNotification(req, res, next) {
    if (!req.user) {
      res.status(401).send('No login')
      return
    }
    Notification.find({ owner: req.user._id }).populate({
      path: 'chatEnd',
      populate: { path: 'userSend' }
    })
      .then((notifications) => {
        res.json(notifications)
      })
      .catch(function (err) {
        res.status(200).send('error')
      })
  }
}
module.exports = new Mecontroller();
