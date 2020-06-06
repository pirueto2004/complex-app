export default class RegistrationForm {
    //Constructor
    constructor() {
        this.allFields = document.querySelectorAll("#registration-form .form-control")
        this.insertValidationElements()
        this.username = document.querySelector("#username-register")
        this.username.previousValue = ""
        this.events()
    }

    //Events
    events() {
        this.username.addEventListener("keyup", () => {
            this.isDifferent(this.username, this.usernameHandler)
        })
    }

    usernameHandler() {
        this.username.errors = false
        this.usernameImmediately()
        clearTimeout(this.username.timer)
        this.username.timer = setTimeout( () => this.usernameAfterDelay(), 3000)
    }

    usernameImmediately() {
        //If username non blank and non-alphanumeric
        if (this.username.value != "" && !/^([a-zA-Z0-9]+)$/.test(this.username.value)) {
            this.showValidationError(this.username, "Username can only contain letters and numbers.")
        }

        //If username exceeds 30 characters
        if (this.username.value.length > 30) {
            this.showValidationError(this.username, "Username cannot exceed 30 characters.")
        }


        if (!this.username.errors) {
            this.hideValidationError(this.username)
        }
    }

    hideValidationError(el) {
        el.nextElementSibling.classList.remove("liveValidateMessage--visible")
    }

    showValidationError(el, message) {
        el.nextElementSibling.innerHTML = message
        el.nextElementSibling.classList.add("liveValidateMessage--visible")
        el.errors = true
    }

    usernameAfterDelay() {
        if (this.username.value.length < 3) {
            this.showValidationError(this.username, "Username must be at least 3 characters.")
        }
    }

    isDifferent(el, handler) {
        if (el.previousValue != el.value) {
            //Keep the this keyword pointing towards the current object
            handler.call(this)
        }
        el.previousValue = el.value
    }


    //Methods
    insertValidationElements() {
        this.allFields.forEach( el => {
            el.insertAdjacentHTML('afterend', '<div class="alert alert-danger small liveValidateMessage"></div>')
        })
    }
}