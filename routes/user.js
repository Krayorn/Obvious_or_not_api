import express from 'express'
import bcrypt from 'bcrypt'
import { validationResult  } from 'express-validator/check'

import User from '../models/User'
import forms from '../forms/user'

const router = express.Router()

router.post('', forms.register, (req, res) => {
    const { username, password } = req.body

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.sjson({status: 422, errors: errors.array().map((error) => error.msg) })
    }

    User.findOne({username}, (err, user) => {
        if(err) throw err
        if (user) {
            return res.sjson({status: 400, error: 'Username already in use'})
        }

        bcrypt.hash(password, 10, (err, hash) => {
            if(err) {
                return res.sjson({
                    status: 500,
                    err,
                })
            }
            else {
                new User({
                    username,
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
    })
})

export default router
