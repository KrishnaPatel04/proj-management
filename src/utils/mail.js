//creating mails using mailgen
const Mailgen = require('mailgen');
const nodemailer = require('nodemailer')

const sendEmail = async (options) => {
    const mailGenerator = new Mailgen({
        theme: "default",
        product: {
            name: 'Task Manager',
            link: "https://taskmanagelink.com"
        }
    })
    const emailTextual = mailGenerator.generatePlaintext(options.mailgenContent)
    const HTMLTextual = mailGenerator.generate(options.mailgenContent)

    const transporter = nodemailer.createTransport({
        host: process.env.MAILTRAP_SMTP_HOST,
        port: process.env.MAILTRAP_SMTP_PORT,
        auth: {
            user: process.env.MAILTRAP_SMTP_USER,
            pass: process.env.MAILTRAP_SMTP_PASS
        }
    })

    const mail = {
        from: "mail.taskmanager@example.com",
        to: options.email,
        subject: options.subject,
        text: emailTextual,
        html: HTMLTextual
    }
    try {
        await transporter.sendMail(mail)
    } catch (error) {
        console.error("Email sevice failed silently.Make sure that you have provided MAILTRAP credential")
        console.error(error)
    }
}


const emailVerificationMailgenContent =
    (username, verificationUrl) => {
        return {
            body: {
                name: username,
                intro: "Welcome to our App, we are excited to have you on board",
                action: {
                    instructions: "To verify your email please click on the following button",
                    button: {
                        color: "#22BC66",
                        text: "Verify your email",
                        link: verificationUrl
                    },
                },
                outro: "Need help, or have questions? Just reply to this email,we would love to help."
            }
        }
    }
const forgotPasswordMailgenContent =
    (username, passwordResetUrl) => {
        return {
            body: {
                name: username,
                intro: "We got a request to reset the password of your account",
                action: {
                    instructions: "To reset your existing password click on the button ",
                    button: {
                        color: "#22BC66",
                        text: "Reset password",
                        link: passwordResetUrl
                    },
                },
                outro: "Need help, or have questions? Just reply to this email,we would love to help."
            }
        }
    }

module.exports = {
    emailVerificationMailgenContent,
    forgotPasswordMailgenContent,
    sendEmail
}
