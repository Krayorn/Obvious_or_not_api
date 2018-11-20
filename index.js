import mongoose from 'mongoose'
import app from './app'

const port = process.env.PORT
const host = process.env.HOST

app.set('ip', host)
app.set('port', port)

mongoose.Promise = global.Promise

const startApp = app => {
    return new Promise((resolve, reject) => {
        const server = app.listen(app.get('port'), app.get('ip'), () => {
            console.log(`Api: ready`.blue)
            return resolve()
        })
        server.on('error', reject)
    })
}

mongoose.connect(`${process.env.MONGODB_URI}`, { useNewUrlParser: true })
    .then(() => console.log(`MongoDB: ready`.blue))
    .then(() => startApp(app))
    .then(() => console.log(`App running on ${app.get('ip')}:${app.get('port')}`.yellow))
    .catch( err => console.log(err.message.bgRed.yellow))
