import express from 'express'
import bcrypt from 'bcrypt'
import User from '../models/User'

const router = express.Router()

router.post('', (req, res) => {
    const { username, password } = req.body

    req.checkBody('username', 'Username is required').notEmpty()
    req.checkBody('password', 'Password is required').notEmpty()
    req.checkBody('passwordCheck', 'Passwords do not match').equals(password)

    req.asyncValidationErrors()
    .then(() => {
        User.findOne({ $or: [{username: username}] }, (err, user) => {
            if(err) throw err
            if (user) {
                if (username == user.username) {
                    return res.sjson({status: 400, error: 'Username already in use'})
                }
                return res.sjson({status: 400, error: 'Email already in use'})
            } else {
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if(err) {
                        return res.sjson({
                            status: 500,
                            err,
                        })
                    }
                    else {
                        new User({
                            username: req.body.username,
                            password: hash
                        }).save().then((result) => {
                            res.sjson({
                                status: 200,
                                data: result
                            })
                        }).catch(err => {
                            res.sjson({
                                status: 500,
                                err,
                            })
                        })
                    }
                })
            }
        })
    })
    .catch((errors) => {
        if (errors) {
            return res.sjson({status: 400, response: errors})
        }
    })

})

export default router
