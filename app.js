import 'colors'
import morgan from 'morgan'
import express from 'express'
import bodyParser from 'body-parser'
import dotenv from 'dotenv'

dotenv.config()

const app = express()

app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))

app.use(bodyParser.urlencoded({
    extended: true
}))

app.use(bodyParser.json())

app.get('/', (req, res) => res.send('HELLO'))

export default app
