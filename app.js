import 'colors'
import morgan from 'morgan'
import express from 'express'
import bodyParser from 'body-parser'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'

import userRouter from './routes/user'
import authRouter from './routes/auth'
import surveyRouter from './routes/survey'

dotenv.config()

const app = express()

app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))

app.use(bodyParser.urlencoded({
    extended: true
}))

app.use(bodyParser.json())

function authChecker(req, res, next) {
    const token = req.body.token || req.headers['x-access-token']
    if (req.url === '/auth' || req.url === '/user') {
        return next()
    }

    if (token) {
        jwt.verify(token, process.env.SECRET, (err, decoded) => {
            if (err) {
                return res.json({ success: false, message: 'Failed to authenticate token.' })
            }
            req.decoded = decoded
            next()
        })
    } else if (req.url === '/survey' && req.method == 'GET') {
        return next()
    }
    else {
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
app.use('/survey', surveyRouter)

export default app
