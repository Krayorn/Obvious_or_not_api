import express from 'express'
import bcrypt from 'bcrypt'
import User from '../models/User'
import { check, validationResult  } from 'express-validator/check'

const router = express.Router()

router.post('', [
        check('username', 'Username is required').exists(),
        check('password', 'Password is required').exists(),
    ], (req, res) => {
    const { username, password } = req.body

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.sjson({status: 422, errors: errors.array().map((error) => error.msg) })
    }

    User.findOne({username: username}, (err, user) => {
        if(err) throw err
        if (user) {
            if (username == user.username) {
                return res.sjson({status: 400, error: 'Username already in use'})
            }
        } else {
            bcrypt.hash(password, 10, (err, hash) => {
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
                        res.sjson({ status: 500, err })
                    })
                }
            })
        }
    })
})

export default router
