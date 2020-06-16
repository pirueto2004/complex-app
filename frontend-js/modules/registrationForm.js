import axios from 'axios'

export default class RegistrationForm {
    //Constructor
    constructor() {
        this.form = document.querySelector("#registration-form")
        this.allFields = document.querySelectorAll("#registration-form .form-control")
        this.insertValidationElements()
        this.username = document.querySelector("#username-register")
        this.username.previousValue = ""
        this.email = document.querySelector("#email-register")
        this.email.previousValue = ""
        this.password = document.querySelector("#password-register")
        this.password.previousValue = ""
        this.username.isUnique = false
        this.email.isUnique = false
        this.events()
    }

    //Events
    events() {
        this.form.addEventListener("submit", e => {
            e.preventDefault()
            this.formSubmitHandler()
        })

        this.username.addEventListener("keyup", () => {
            this.isDifferent(this.username, this.usernameHandler)
        })

        this.email.addEventListener("keyup", () => {
            this.isDifferent(this.email, this.emailHandler)
        })

        this.password.addEventListener("keyup", () => {
            this.isDifferent(this.password, this.passwordHandler)
        })

        this.username.addEventListener("blur", () => {
            this.isDifferent(this.username, this.usernameHandler)
        })

        this.email.addEventListener("blur", () => {
            this.isDifferent(this.email, this.emailHandler)
        })

        this.password.addEventListener("blur", () => {
            this.isDifferent(this.password, this.passwordHandler)
        })

    }

    //Methods

    formSubmitHandler() {
        //Run all validation checks first
        this.usernameImmediately()
        this.usernameAfterDelay()
        this.emailAfterDelay()
        this.passwordImmediately()
        this.passwordAfterDelay()

        //If everything is correct then we can submit the form
        if (
            this.username.isUnique &&
            !this.username.errors &&
            this.email.isUnique &&
            !this.email.errors &&
            !this.password.errors
        ) {
            this.form.submit()
        }
    }

    passwordHandler() {
        this.password.errors = false
        this.passwordImmediately()
        clearTimeout(this.password.timer)
        this.password.timer = setTimeout( () => this.passwordAfterDelay(), 800)
    }

    passwordImmediately() {
        if (this.password.value.length > 50) {
            this.showValidationError(this.password, "Password cannot exceed 50 characters.")
        }

        if (!this.password.errors) {
            this.hideValidationError(this.password)
        }
    }

    passwordAfterDelay() {
        if (this.password.value.length < 12) {
            this.showValidationError(this.password, "Password must be at least 12 characters.")
        }
    }

    emailHandler() {
        this.email.errors = false
        clearTimeout(this.email.timer)
        this.email.timer = setTimeout( () => this.emailAfterDelay(), 800)
    }

    emailAfterDelay() {
        //If email is not a regular expression
        if (!/^\S+@\S+$/.test(this.email.value)) {
            this.showValidationError(this.email, "You must provide a valid email address.")
        }

        //If there are no errors
        if (!this.email.errors) {
            axios.post('/doesEmailExist', {email: this.email.value}).then( (response) => {
                if (response.data) {
                    this.email.isUnique = false
                    this.showValidationError(this.email, "That email is already being used.")
                } else {
                    this.email.isUnique = true
                    this.hideValidationError(this.email)
                }
                
            }).catch( () => {
                console.log("Please try again later.")
            })
        }
    }

    usernameHandler() {
        this.username.errors = false
        this.usernameImmediately()
        clearTimeout(this.username.timer)
        this.username.timer = setTimeout( () => this.usernameAfterDelay(), 800)
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
        //If username is less than 3 characters
        if (this.username.value.length < 3) {
            this.showValidationError(this.username, "Username must be at least 3 characters.")
        }

        //If the current value is valid we make sure that it is not taken
        if (!this.username.errors) {
            axios.post('/doesUsernameExist', {username: this.username.value}).then( (response) => {
                if (response.data) {
                    this.showValidationError(this.username, "Username already taken.")
                    this.username.isUnique = false
                } else {
                    this.username.isUnique = true
                }
            }).catch( () => {
                console.log("Please try again later.")
            })
        }
    }

    isDifferent(el, handler) {
        if (el.previousValue != el.value) {
            //Keep the this keyword pointing towards the current object
            handler.call(this)
        }
        el.previousValue = el.value
    }

    insertValidationElements() {
        this.allFields.forEach( el => {
            el.insertAdjacentHTML('afterend', '<div class="alert alert-danger small liveValidateMessage"></div>')
        })
    }
}