// import { Server } from "mongodb"

import DOMPurify from 'dompurify'

export default class Chat {
    constructor() {
        // alert("Chat feature is loading")
        this.openedYet = false
        this.chatWrapper = document.querySelector("#chat-wrapper")
        this.openIcon = document.querySelector(".header-chat-icon")
        this.injectHTML()
        this.chatLog = document.querySelector("#chat")
        this.chatField = document.querySelector("#chatField")
        this.chatForm = document.querySelector("#chatForm")
        this.closeIcon = document.querySelector(".chat-title-bar-close")
        this.events()
    }

    //Events

    events() {
        this.chatForm.addEventListener("submit", (e) => {
            e.preventDefault()
            this.sendMessageToServer()
        })
        this.openIcon.addEventListener("click", () => this.showChat())
        this.closeIcon.addEventListener("click", () => this.hideChat())
    }

    //Methods
    sendMessageToServer() {
        this.socket.emit('chatMessageFromBrowser', {message: this.chatField.value})
        this.chatLog.insertAdjacentHTML('beforeend', DOMPurify.sanitize(`
        <div class="chat-self">
            <div class="chat-message">
                <div class="chat-message-inner">
                    ${this.chatField.value}
                </div>
            </div>
            <img class="chat-avatar avatar-tiny" src="${this.avatar}">
        </div>
        `))

        //Scrolls vertically the chat log to the very bottom to make the last message visible
        this.chatLog.scrollTop = this.chatLog.scrollHeight

        this.chatField.value = ''
        this.chatField.focus()
    }

    injectHTML() {
        this.chatWrapper.innerHTML = `
            <div class="chat-title-bar">Chat <span class="chat-title-bar-close"><i class="fas fa-times-circle"></i></span></div>
            <div id="chat" class="chat-log"></div>
            <form id="chatForm" class="chat-form border-top">
                <input type="text" class="chat-field" id="chatField" placeholder="Type a message…" autocomplete="off">
            </form>
        `
    }

    showChat() {
        if (!this.openedYet) {
            this.openConnection()
        }
        this.openedYet = true
        this.chatWrapper.classList.add("chat--visible")
        this.chatField.focus()
    }

    openConnection() {
        //This function will open a connection between the browser and our server
        // alert("Opening a connection!")
        this.socket = io()

        this.socket.on('welcome', data => {
            this.username = data.username
            this.avatar = data.avatar
        })

        this.socket.on('chatMessageFromServer', data => {
            this.displayMessageFromServer(data)
        })
    }

    displayMessageFromServer(data) {
        this.chatLog.insertAdjacentHTML('beforeend', DOMPurify.sanitize(`
        <div class="chat-other">
            <a href="/profile/${data.username}"><img class="avatar-tiny" src="${data.avatar}"></a>
            <div class="chat-message"><div class="chat-message-inner">
            <a href="/profile/${data.username}"><strong>${data.username}:</strong></a>
             ${data.message}
            </div></div>
        </div>
        `))
        //Scrolls vertically the chat log to the very bottom to make the last message visible
        this.chatLog.scrollTop = this.chatLog.scrollHeight
    }

    hideChat() {
        this.chatWrapper.classList.remove("chat--visible")
    }
}