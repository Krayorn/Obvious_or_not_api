import 'colors'
import morgan from 'morgan'
import express from 'express'
import bodyParser from 'body-parser'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import expressValidator from 'express-validator'

import userRouter from './routes/user'
import authRouter from './routes/auth'

dotenv.config()

const app = express()

app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))

app.use(bodyParser.urlencoded({
    extended: true
}))

app.use(bodyParser.json())

app.use(expressValidator({
    errorFormatter: (param, msg, value) => {
        const namespace = param.split('.')
        let formParam    = namespace.shift()

        while(namespace.length) {
            formParam += '[' + namespace.shift() + ']'
        }
        return {
            param : formParam,
            msg   : msg,
            value : value
        }
    },
}))

function authChecker(req, res, next) {
    const token = req.body.token || req.headers['x-access-token']
    if (req.url === '/auth' || req.url === '/user') {
        return next()
    }

    if (token) {
        jwt.verify(token, 'secret', (err, decoded) => {
            if (err) {
                return res.json({ success: false, message: 'Failed to authenticate token.' })
            }
            req.decoded = decoded
            next()
        })
    } else {
        res.redirect('/auth')
    }
}

app.use(authChecker)

app.use((req, res, next) => {
    res.sjson = (data) => {
        res.status(data.status).json(data)
    }

    return next()
})

app.use('/user', userRouter)
app.use('/auth', authRouter)

export default app
