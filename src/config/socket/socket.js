var Chat = require('..//..//app/models//Chat')
var Room = require('..//..//app/models//Room')
var User = require('..//..//app/models/User')
var Notification = require('..//..//app/models//Notification')
var convertText = require('..//..//util/convertText')
module.exports = function (io) {
    var userOnline = {}
    var socketLocation = {}
    io.on('connection', (socket) => {
        socket.userID = socket.request.session.passport != undefined ? socket.request.session.passport.user : undefined;
        if (socket.userID) {
            // 1 user online singer drive
            if (!userOnline[socket.userID]) {
                userOnline[socket.userID] = [socket.id]
            } else {
                // 1 user online mutiple drive
                userOnline[socket.userID].push(socket.id)
            }
        }
        // get location client 
        socket.on('location', function (data) {
            if (socket.userID && data) {
                // client was login
                socketLocation[socket.id] = {
                    location: data.split('/')[4],
                    memberID: data.split('/')[5] // if client is where page Chat
                }
            }

        })
        socket.on('disconnect', function () {
            // xoa ra khoi user online
            let userRemove = userOnline[socket.userID]
            if (userRemove) {
                for (var i = 0; i < userRemove.length; i++) {
                    if (userRemove[i] == socket.id) {
                        userRemove.splice(i, 1)
                        break
                    }
                }
                delete socketLocation[socket.id]
                if (userOnline[socket.userID].length == 0) {
                    delete userOnline[socket.userID]
                }
            } else {
                console.log('chua dang nhap')
            }
        })
        // get request server return list user online in room 
        socket.on('Request_Server_Check_User_Onlinie', (data) => {
            for (const user in data) {
                if (userOnline[user]) {
                    // online -- default offline
                    data[user] = true
                }
            }
            // send result user online each room into client
            socket.emit('result_User_Onlinie_each_Room', data)
        })
        // receive message from client
        socket.on('Send-massage', (data) => {
            if (!data)
                return
            let chat = new Chat()
            chat.status = false  //defautlt false chua xem
            // format time message
            data.timeHours = convertText.timeHours(new Date())
            data.timeAgo = convertText.timeAgo(new Date())

            let userSocketReceive = userOnline[data.userReceive]

            if (userSocketReceive && userSocketReceive.length > 0) {
                for (var i = 0; i < userSocketReceive.length; i++) {
                    // check where is client page Chat 
                    if (socketLocation[userSocketReceive[i]].location == 'chat') {
                        //client here page Chat &&  check room showing in page\
                        if (socketLocation[userSocketReceive[i]].memberID == socket.userID) {
                            // USer receive living room
                            chat.status = true // da xem :
                            // send message to client
                            io.to(userSocketReceive[i]).emit('receive-massage', data)
                        } else {
                            // here page Chat but differences room  
                            data.userSend = socket.userID
                            io.to(userSocketReceive[i]).emit('miss-message-end', data)
                            send_notification_socket(userSocketReceive[i], data)
                        }
                    } else {
                        // client NOT here page Chat
                        send_notification_socket(userSocketReceive[i], data)
                    }
                }
                async function send_notification_socket(socketID, data) {
                    let user = await User.findOne({ _id: socket.userID })
                    io.to(socketID).emit('notification', { chat: data, user })
                }
            }
            userOnline[socket.userID].forEach(function (id) {
                io.to(id).emit('response-message-to-client', { data: data, status: chat.status })
            })
            // offline 
            if (!chat.status) {
                Notification.findOne({ userSend: socket.userID, owner: data.userReceive })
                    .then((notification) => {
                        if (notification) {
                            Notification.updateOne({ userSend: socket.userID, owner: data.userReceive },
                                { chatEnd: chat._id, amount: notification.amount + 1 }, function (err, docs) {
                                    if (err) {
                                        console.log(err)
                                    }
                                });
                        } else {
                            var notification = new Notification()
                            notification.type = 'message'
                            notification.chatEnd = chat._id
                            notification.owner = data.userReceive
                            notification.userSend = socket.userID
                            notification.amount = 1
                            notification.save()
                        }
                    })
                    .catch((err) => {
                        console.log('err' + err)
                    })
            }
            //save database
            let missMessage = chat.status ? '0' : '1'
            Room.findOneAndUpdate({ owner: data.userReceive, userReceive: socket.userID }, { chatEnd: chat._id, $inc: { missMessage: missMessage } }, { new: true })
                .then((room) => {
                    if (!room) {
                        room = new Room({ owner: data.userReceive, userReceive: socket.userID, chatEnd: chat._id, missMessage: missMessage })
                        room.save()
                    }
                    chat.member.push(socket.userID)
                    chat.member.push(data.userReceive)
                    chat.roomReceive = room._id
                    chat.roomSend = data.roomID
                    chat.message = data.message
                    chat.room = room._id
                    return chat
                })
                .then((chat) => {
                    chat.save()
                        .then(() => {
                        })
                })
                .catch((err) => {
                    console.log('err' + err)
                })
        })

        socket.on('ReqStatusTyping', function (req) {
            if (userOnline[req.user]) {
                userOnline[req.user].forEach(function (id) {
                    io.to(id).emit('ResStatusTyping', req.status)
                })
            }
        })
    });
}