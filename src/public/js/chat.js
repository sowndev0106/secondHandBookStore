'use strict'
// send location now

var userReceive = window.location.href.split('/')[window.location.href.split('/').length - 1]
var time = (new Date()).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
var avatarDefault = '/images/user5.png'
var linkAvatar = document.getElementById('avatar').src
var timeReloadCheckUserOnline = 1000 * 60 * 3 // 3 phut 
var listUserInRoom = {}
var totalPageChat = 1
var roomID = ''
var pageMessageNow = 1
var scrollHeight = 0

function loadMessageWithPage(page) {
    console.time("answer time");
    if (userReceive == 'chat')
        userReceive = ''
    if (page == 0 || page > totalPageChat) {
        $('.loadingChat').hide()
        return
    }
    fetch('/api/me/getmessages/' + userReceive + '?soft=createdAt&type=desc&page=' + page)
        .then(response => response.json())
        .then(data => {
            $('.loadingChat').hide()
            totalPageChat = data.chats.totalPages
            let chats = data.chats.docs
            if (chats.length == 0) {
                if (page == 1) {
                    pageMessageNow = 0
                    // $('.type_msg').attr('disabled', 'disabled')
                    $('#msg_card_body').html(`
                <div class="text-center">
                <h5 class="text-light">Hiện tại bạn chưa có tin nhắn nào</h5>
                </div>
                `)
                }
                throw 'no have chat'
            }

            let messagesBody = $('.msg_card_body')
            let content = ''
            let avatarReceive = $(`#userReceive_${userReceive} .user_img`).attr('src')

            for (let i = chats.length - 1; i >= 0; i--) {
                let chat = chats[i]
                let checkUser = roomID == chat.roomSend
                let status = chat.status ? '<i class="far fa-check-double"></i>' : '<i class="far fa-check"></i>' // seen or no seen 
                if (checkUser) {
                    // send (me)
                    content += `
                        <div class="d-flex justify-content-end mb-3">
                            <div class="msg_cotainer_send">
                               ${chat.message}
                                <span class="msg_time_send">${formatTime(chat.createdAt)}
                  ${status}
                                </span>
                            </div>
                            <div class="img_cont_msg">
                                <img src="${linkAvatar}" class="rounded-circle user_img_msg">
                            </div>
                        </div>
    `
                } else {
                    // receive
                    content += `  
                 <div class="d-flex justify-content-start mb-3">
                            <div class="img_cont_msg">
                                <img src="${avatarReceive}"
                                    class="rounded-circle user_img_msg">
                            </div>
                            <div class="msg_cotainer">
                                ${chat.message}
                                <span class="msg_time"> ${formatTime(chat.createdAt)} </span>
                            </div>
                        </div>
                    
                    `
                }
            }
            messagesBody.prepend(content)
            // set status message
            // delete notification
            restartNotification()

            if (page == 1) {
                chatBotom()
            } else {

                document.getElementById('msg_card_body').scrollTop = document.getElementById('msg_card_body').scrollHeight - scrollHeight
                scrollHeight = document.getElementById('msg_card_body').scrollHeight
            }
            // set height scroll

        })
        // if href = /me/chat => userReceive = chat
        .catch((e) => {
            $('.loadingChat').hide()
            console.log('Chat load ERROR: ' + e)
        })
}
function loadRooms() {
    var listRoom = $('#listRoom')
    fetch('/api/me/getrooms')
        .then(response => response.json())
        .then(data => {
            let rooms = data.rooms
            if (rooms.length == 0) {
                alert('Bạn chưa có Nhắn tin với ai')
                return
            }
            for (const room of rooms) {

                try {
                    // check onlinew ; if true online : offline
                    listUserInRoom[room.userReceive._id] = false

                    let avatar = room.userReceive.avatar == undefined ? avatarDefault : room.userReceive.avatar
                    let active = room.userReceive._id == userReceive ? 'active' : '' // *
                    let miss = room.missMessage || 0
                    let checkMiss = ''
                    if (miss == 0) {
                        checkMiss = 'style="display: none"'
                    }

                    let lastMassage
                    if (room.chatEnd) {
                        lastMassage = room.chatEnd.message
                        if (lastMassage.length > 27)
                            lastMassage = lastMassage.substr(0, 25) + ' ...'
                        if (room.chatEnd.userSend === userReceive) {
                            lastMassage = `<p id ='chat_end_${room.userReceive._id}'>${room.userReceive.lastName}: ${lastMassage}  </p>`
                        } else {
                            lastMassage = `<p id ='chat_end_${room.userReceive._id}'>Bạn: ${lastMassage}  </p>`
                        }
                    } else {
                        lastMassage = ''
                    }
                    listRoom.append(`
                            <li class="${active} room" id='userReceive_${room.userReceive._id}' data-user_receive="${room.userReceive._id}" data-room_id="${room._id}">
                                <div class="d-flex bd-highlight">
                                    <div class="img_cont">
                                        <img src="${avatar}" 
                                            class="rounded-circle user_img ">
                                        <span class="online_icon" ></span>
                                    </div>
                                    <div class="user_info">
                                      <div >
                                       <span class='fullName_receive'>${uppercaseFirst(room.userReceive.lastName)} ${uppercaseFirst(room.userReceive.firstName)}</span>
                                        ${lastMassage}
                                      </div>
                                        <div>
                                          <i class="bg-danger text-white miss" id='miss_message' ${checkMiss}>${miss}</i>
                                           </div>
                                    </div>
                                </div>
                            </li>
        `)
                } catch (error) {
                    console.log('error show room' + error)
                }
            }
            return rooms
        })
        .then(function (rooms) {

            // check url constants userReceive // userReceive == rooms[0].owner <=> chat myself
            if (window.location.href.split('/')[window.location.href.split('/').length - 1] == 'chat' || userReceive == rooms[0].owner) {
                changeUrl(rooms[0].userReceive._id)
            }
            RequestServerCheckUserOnlinie()
            socket.emit('Request_Server_Check_User_Onlinie', listUserInRoom)
            loadMessageWithPage(pageMessageNow)
            LoadFullNameAndAvatarRecived()
        })
        .catch((err) => {
            console.log(err)
        })
}

function LoadFullNameAndAvatarRecived() {

    roomID = $(`#userReceive_${userReceive}`).data('room_id')
    $('.room').removeClass('active')
    $(`#userReceive_${userReceive}`).addClass('active')
    var avatarReceive = $(`#userReceive_${userReceive} .user_img `).attr('src')
    var fullName = $(`#userReceive_${userReceive} .fullName_receive`).text()
    var status = $(`#userReceive_${userReceive} .online_icon`).hasClass('offline')
    if (!status) {
        $('#status_Receive_Main').removeClass(`offline`)
    } else {
        $('#status_Receive_Main').addClass(`offline`)
    }
    $('#avatar_receive_main').attr('src', avatarReceive)
    $('#fullName_receive_main').text(fullName)
}



function changeUrl(userID) {
    if (userID) {
        // change url 
        userReceive = userID
        window.history.pushState(undefined, 'Chat', '/me/chat/' + userID);
        // update url into server
        socket.emit('location', window.location.href)
    }
}

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
            $(`#userReceive_${user} .online_icon`).addClass('offline')
        } else {
            $(`#userReceive_${user} .online_icon`).removeClass('offline')
        }
    }
    LoadFullNameAndAvatarRecived()
})

window.addEventListener('DOMContentLoaded', (event) => {
    loadRooms()
    var linkAvatarMain = $('#avatar').attr('src')

    // change room
    $('body').on('click', '.room', function (e) {
        let userInRoom = this.dataset.user_receive
        if (userInRoom == userReceive)
            return
        $('.msg_card_body').html('')
        pageMessageNow = 1
        userReceive = userInRoom
        changeUrl(userInRoom)
        LoadFullNameAndAvatarRecived()
        loadMessageWithPage(1)
    })


    // send massage into server
    $('.send_btn').click(() => {
        var message = $('.type_msg').val()
        if (!message) {
            return
        }

        // send masage into server

        socket.emit('Send-massage', {
            userReceive, roomID, message
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
        let avatarReceive = $(`#userReceive_${userReceive} .user_img`).attr('src')

        $('.msg_card_body').append(`
          <div class="d-flex justify-content-start mb-4">
                            <div class="img_cont_msg">
                                <img src="${avatarReceive}"
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

        axios.get('/api/account/search?q=' + q)
            .then(function (result) {
                let users = result.data
                showResult.html('')
                users.forEach(function (user) {

                    let avatar = user.avatar || avatarDefault
                    showResult.append(`<a class="dropdown-item d-flex align-items-center border-bottom" href="/me/chat/${user._id}">
                                    <img src="${avatar}" class="rounded-circle" style='width: 40px; margin-right: 20px;' alt=""
                                        srcset="">
                                    <span> ${uppercaseFirst(user.firstName)} ${uppercaseFirst(user.lastName)}</span>
                                </a>`)
                })
                if (showResult.text() == '') {
                    showResult.html('')
                    showResult.append(`<div class="text-center"> <span> Không tìm thấy kết quả </span> </div>`)
                }
            })
            .catch(function (err) {
                console.log('search' + err)
                showResult.html('')
                showResult.append(`<div class="text-center"> <span> Không tìm thấy kết quả </span> </div>`)
            })

    })
    // even load further chat message
    $('#msg_card_body').on('scroll', function (e) {
        let location = this.scrollTop
        if (pageMessageNow == 0 || pageMessageNow > totalPageChat) {
            $('.loadingChat').hide()
            return
        }
        if (location == 0) {
            $('.loadingChat').show()
            scrollHeight = document.getElementById('msg_card_body').scrollHeight
            pageMessageNow++
            loadMessageWithPage(pageMessageNow)
        }

    })
})
function chatBotom() {
    var chatHistory = document.getElementById('msg_card_body')
    chatHistory.scrollTop = chatHistory.scrollHeight
    scrollHeight = chatHistory.scrollHeight
}
var formatTime = (time) => {
    moment.locale("vi");
    return moment(time).calendar();
}
