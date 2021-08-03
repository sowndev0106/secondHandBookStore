'use strict'


var userReceive = window.location.href.split('/')[window.location.href.split('/').length - 1]
var time = (new Date()).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
var avatarDefault = '/images/user5.png'
var linkAvatar = document.getElementById('avatar').src
var userID
var timeReloadCheckUserOnline = 1000 * 60 * 3 // 3 phut 
var listUserInRoom = {}
// send location now


loadMessageWithPage(1)
function loadMessageWithPage(page) {
    // if href = /me/chat => userReceive = chat
    if (userReceive == 'chat')
        userReceive = ''

    axios.get('/me/getMessages/' + userReceive + '?soft=createdAt&type=desc&page=' + page)
        .then((result) => {
            if (!result.data.chats) {
                $('#chat').html(`
            <div class="text-center">
            <h3>Hiện tại bạn chưa có tin nhắn nào</h3>
            <a href="/">Nhấn vào đây để quay lại</a>
        </div>
            `)
                console.log('loi')
                throw 'no have room'
            }
            let messages = result.data.chats.docs

            userID = result.data.userID
            // userReceive == null => dafault first room (user)
            if (window.location.href.split('/')[window.location.href.split('/').length - 1] == 'chat' && userReceive != result.data.userReceive) {
                userReceive = result.data.userReceive
                // change url 
                window.history.pushState(undefined, 'Chat', '/me/chat/' + userReceive);
                // update url into server
                socket.emit('location', window.location.href)
            }
            var rooms = result.data.rooms


            try {
                showRooms(rooms)
            } catch (error) {
                console.log('load room' + error)
            }
            try {
                if (messages) {
                    showMessages(messages)
                }
            } catch (error) {
                console.log('load message' + error)
            }
            chatBotom()
            // delete notification
            restartNotification()

        })
        .catch((e) => {
            console.log('Chat load' + e)
        })

}
function showMessages(messages) {
    var messagesBody = document.getElementById('msg_card_body')
    var content = ''
    let length = messages.length - 1
    for (var i = length; i >= 0; i--) {
        var message = messages[i]
        var checkUser = userID == message.userSend
        let status = message.status ? '<i class="far fa-check-double"></i>' : '<i class="far fa-check"></i>'
        if (checkUser) {
            // send (me)
            content += `
                        <div class="d-flex justify-content-end mb-4">
                            <div class="msg_cotainer_send">
                               ${message.message}
                                <span class="msg_time_send">${formatTime(message.createdAt)}
                  ${status}
                                </span>
                            </div>
                            <div class="img_cont_msg">
                                <img src="${linkAvatar}" class="rounded-circle user_img_msg">
                            </div>
                        </div>
    `} else {
            // receive
            content += `
                 <div class="d-flex justify-content-start mb-4">
                            <div class="img_cont_msg">
                                <img src="${document.getElementById('avatar_receive_' + userReceive).src}"
                                    class="rounded-circle user_img_msg">
                            </div>
                            <div class="msg_cotainer">
                                ${message.message}
                                <span class="msg_time"> ${formatTime(message.createdAt)} </span>
                            </div>
                        </div>
            `
        }
    }
    messagesBody.innerHTML = content + messagesBody.innerHTML
    // set status message

}
function showRooms(rooms) {

    if (rooms.length == 0)
        return
    var listRoom = document.getElementById('listRoom')
    listRoom.innerHTML = ''
    rooms.forEach((room) => {
        try {
            // check onlinew ; if true online : offline
            listUserInRoom[room.member[0]._id] = false
            let avatar = room.member[0].avatar == undefined ? avatarDefault : room.member[0].avatar
            let active = room.member[0]._id == userReceive ? 'active' : ''
            let miss = room.miss || 0
            let checkMiss
            if (miss == 0) {
                checkMiss = 'style="display: none"'
            }
            let lastMassage
            if (room.chatEnd) {
                lastMassage = room.chatEnd.message
                if (lastMassage.length > 27)
                    lastMassage = lastMassage.substr(0, 25) + ' ...'
                if (room.chatEnd.userSend === userReceive) {
                    lastMassage = `<p id ='chat_end_${room.member[0]._id}'>${room.member[0].lastName}: ${lastMassage}  </p>`
                } else {
                    lastMassage = `<p id ='chat_end_${room.member[0]._id}'>Bạn: ${lastMassage}  </p>`
                }
            } else {
                lastMassage = ''
            }
            listRoom.innerHTML += `
                            <li class="${active}">
                                <div class="d-flex bd-highlight" onclick = 'changeRoom("${room.member[0]._id}")'>
                                    <div class="img_cont">
                                        <img src="${avatar}" id='avatar_receive_${room.member[0]._id}'
                                            class="rounded-circle user_img">
                                        <span class=" online_icon status_Receive_${room.member[0]._id}" ></span>
                                    </div>
                                    <div class="user_info">
                                      <div >
                                       <span id='fullName_receive_${room.member[0]._id}'>${room.member[0].lastName} ${room.member[0].firstName}</span>
                                        ${lastMassage}
                                      </div>
                                        <div>
                                          <i class="bg-danger text-white miss" id='miss_${room.member[0]._id}' ${checkMiss}>${miss}</i>
                                           </div>
                                    </div>
                                </div>
                            </li>
        `
        } catch (error) {
            console.log('error show room' + error)
        }
    })
    LoadFullNameAndAvatarRecived()
    socket.emit('Request_Server_Check_User_Onlinie', listUserInRoom)
}
function changeRoom(userID) {
    if (userID) {
        userReceive = userID
        window.history.pushState(undefined, 'Chat', '/me/chat/' + userReceive);
        loadMessageWithPage(1)
        // clear chat message
        document.getElementById('msg_card_body').innerHTML = ''
        socket.emit('location', window.location.href)
    }
}
function LoadFullNameAndAvatarRecived() {
    var avatarReceive = $('#avatar_receive_' + userReceive).attr('src')
    var fullName = $('#fullName_receive_' + userReceive).text()
    $('#status_Receive_Main').addClass(`status_Receive_${userReceive}`)
    $('#avatar_receive_main').attr('src', avatarReceive)
    $('#fullName_receive_main').text(fullName)
}


window.addEventListener('DOMContentLoaded', (event) => {
    var linkAvatarMain = $('#avatar').attr('src')

    // request server return list user online in room 
    // Each 5 minute

    setTimeout(RequestServerCheckUserOnlinie, timeReloadCheckUserOnline);
    function RequestServerCheckUserOnlinie() {
        socket.emit('Request_Server_Check_User_Onlinie', listUserInRoom)
        setTimeout(RequestServerCheckUserOnlinie, timeReloadCheckUserOnline); // repeat myself
    }
    // result return user online in room 
    socket.on('result_User_Onlinie_each_Room', (data) => {
        for (let user in data) {
            if (!data[user]) {
                $(`.status_Receive_${user}`).addClass('offline')
            } else {
                $(`.status_Receive_${user}`).removeClass('offline')
            }
        }
    })


    // send massage into server
    $('.send_btn').click(() => {
        var message = $('.type_msg').val()
        if (!message) {
            return
        }

        // send masage into server

        socket.emit('Send-massage', {
            userReceive, message
        })
        $('.type_msg').val('')

    })
    // add chat myself in form chat
    socket.on('response-message-to-client', (req) => {
        let status = req.status ? '<i class="far fa-check-double"></i>' : '<i class="far fa-check"></i>'
        $('.msg_card_body').append(`
         <div class="d-flex justify-content-end mb-4">
                            <div class="msg_cotainer_send">
                              ${req.data.message}
                                <span class="msg_time_send">${formatTime(new Date())} ${status}</span>
                            </div>
                            <div class="img_cont_msg">
                                <img src="${linkAvatarMain}" class="rounded-circle user_img_msg">
                            </div>
                        </div>
        `)
        chatBotom()
    })
    // enter
    $('.type_msg').keypress(function (event) {
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode == '13') {
            $('.send_btn').click()
        }
    });

    // receive message from server
    socket.on('receive-massage', (data) => {
        $('.msg_card_body').append(`
          <div class="d-flex justify-content-start mb-4">
                            <div class="img_cont_msg">
                                <img src="${document.getElementById('avatar_receive_' + userReceive).src}"
                                    class="rounded-circle user_img_msg">
                            </div> 
                            <div class="msg_cotainer">
                                ${data.message}
                                <span class="msg_time">${data.timeHours}</span>
                            </div>
                        </div>
            `)
        chatBotom()
    })

    // change quanlyti miss and message end
    socket.on('miss-message-end', function (data) {
        document.title = ' (Có tin nhắn mới)'
        let quanlyti = $('#miss_' + data.userSend).text() // userReceivers
        let massage = data.message
        let lastName = $('#fullName_receive_' + data.userSend).text()
        lastName = lastName.split(" ")[lastName.split(" ").length - 1]
        if (/[0-9]+/.test(quanlyti)) {
            quanlyti = parseInt(quanlyti) + 1
            $('#miss_' + data.userSend).text(quanlyti)

            $('#miss_' + data.userSend).show()
            if (massage.length > 27)
                massage = massage.substr(0, 25) + ' ...'
            $('#chat_end_' + data.userSend).text(lastName + ': ' + data.message)
        }
    })
    // emoji
    // typing
    $('.type_msg').keyup(() => {
        if ($('.type_msg').val() == '') {
            socket.emit('ReqStatusTyping', { user: userReceive, status: false })
        } else {
            socket.emit('ReqStatusTyping', { user: userReceive, status: true })
        }
    })
    // typing
    $('.type_msg').blur(() => {
        socket.emit('ReqStatusTyping', { user: userReceive, status: false })
    })
    // typing
    socket.on('ResStatusTyping', function (status) {
        if (status) {
            $('.statusTyping').show()
        } else {
            $('.statusTyping').hide();
        }
    })
    $('#searchUser').on('focus', function (e) {
        $('#resultSearchUser').html(`<div class="text-center"> <span> Nhập tên người dùng</span> </div>`)
    })
    // search user
    $('#searchUser').on('keyup', function (e) {
        let q = $('#searchUser').val()
        let showResult = $('#resultSearchUser')
        if (q.trim() == '') {
            showResult.html(`<div class="text-center"> <span> Nhập tên người dùng</span> </div>`)
            return
        }
        showResult.html('')
        axios.get('/api/account/search?q=' + q)
            .then(function (result) {
                let users = result.data
                users.forEach(function (user) {
                    let avatar = user.avatar || avatarDefault
                    showResult.append(`<a class="dropdown-item d-flex align-items-center border-bottom" href="/me/chat/${user._id}">
                                    <img src="${avatar}" class="rounded-circle" style='width: 40px; margin-right: 20px;' alt=""
                                        srcset="">
                                    <span>${user.firstName} ${user.lastName}</span>
                                </a>`)
                })
                if (showResult.text() == '') {
                    showResult.append(`<div class="text-center"> <span> Không tìm thấy kết quả </span> </div>`)
                }
            })
            .catch(function (err) {
                console.log('search' + err)
                showResult.append(`<div class="text-center"> <span> Không tìm thấy kết quả </span> </div>`)
            })

    })

})
function chatBotom() {

    var chatHistory = document.getElementById('msg_card_body')
    chatHistory.scrollTop = chatHistory.scrollHeight;
}
var formatTime = (time) => {
    moment.locale("vi");
    return moment(time).calendar();
}
