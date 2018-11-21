import 'colors'
import morgan from 'morgan'
import express from 'express'
import bodyParser from 'body-parser'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'

import userRouter from './routes/user'
import authRouter from './routes/auth'

dotenv.config()

const app = express()

app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))

app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(bodyParser.json())

function authChecker(req, res, next) {
    const token = req.body.token || req.headers['x-access-token']
    if (req.url === '/auth/') {
        return next()
    }

    if (token) {
        console.log('next')
        jwt.verify(token, 'secret', (err, decoded) => {
            if (err) {
                return res.json({ success: false, message: 'Failed to authenticate token.' })
            }
            console.log(decoded)
            req.decoded = decoded
            next()
        })
    } else {
        console.log('redirect')
        res.redirect('/auth')
    }
}

app.use(authChecker)


app.get('/', (req, res) => res.send('hello'))
app.use('/user', userRouter)
app.use('/auth', authRouter)

export default app
