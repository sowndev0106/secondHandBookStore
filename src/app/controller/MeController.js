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
  chat(req, res, next) {
    var user1 = req.user._id
    var user2 = req.params.userID
    if (user2) {
      // check have room // find or create
      Room.findOne({ member: { $all: [user1, user2] } }, function (err, data) {
        if (!data) {
          var room = new Room()
          room.member.push(user1)
          room.member.push(user2)
          room.save()
        }
      })
    }
    res.render('me/chat')

  }
  // [GET] /me/getMessages
  getMessages(req, res) {
    var limitChat = 10
    var pagination_soption = pagination_soft_soption.paginatoin_soft(req, res, limitChat)
    var user1 = req.user._id
    var user2 = req.params.userID
    var option = pagination_soption.option
    option.populate = ([{
      path: 'User',
      populate: 'userSend'
    }]);
    // var room = new Room()
    // room.member = [user1, user2]

    Room.find({ member: { $in: [user1] } }).populate({ path: 'member', match: { _id: { $ne: user1 } } }).populate('chatEnd')
      .then(async function (rooms) {

        if (rooms.length == 0) {
          throw 'no have room';

        }
        // check don't chat with myself
        let query = {}
        if (user2 == undefined || user1 == user2) {
          // take room first default
          user2 = rooms[0].member[0]._id
        }
        query = { member: { $all: [user1, user2] } }
        let room = await Room.findOne(query)
        return Promise.all([rooms, room])
      })
      // find room userMain and userSecond 

      .then(async ([rooms, room]) => {
        // change all chat of room now  => seen
        await Chat.updateMany({ userSend: user2, userReceive: user1 }, { status: true });
        // miss message
        rooms = rooms.map((room) => {
          console.log(rooms)
          Chat.countDocuments({ room: room._id, status: false, userReceive: user1 })
            .then((data) => {
              room.miss = data
            })
          return room
        })
        return Promise.all([rooms, Chat.paginate({ room: room._id }, option)])
      })
      .then(([rooms, chats]) => {
        res.json({
          rooms: rooms,
          chats: chats,
          userID: user1,
          userReceive: user2
        })

        // delete notificartion
        Notification.deleteOne({ owner: user1, userSend: user2 }, function (err) {
          if (err) {
            console.log('xoa that bai' + err)
          } else {
            console.log('xoa thanh cong')
          }
        })
      })
      .catch(function (err) {
        console.log(err)
        res.json({})
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
