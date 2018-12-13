import express from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

import User from '../models/User'
import forms from '../forms/auth'

const router = express.Router()

router.post('', forms.auth, (req, res) => {
    User.findOne({username: req.body.username}, (err, user) => {
        if (!user) {
            return res.sjson({
                status: 401,
                error: 'Unrecognised Username'
            })
        }
        bcrypt.compare(req.body.password, user.password, (err, result) => {
            if(err) {
                return res.sjson({
                    status: 401,
                    error: 'Unauthorized Access'
                })
            }
            if(result) {
                const JWTToken = jwt.sign({
                        username: user.username,
                        _id: user._id
                    },
                    process.env.SECRET,
                    {
                        expiresIn: '1y'
                    })

                    return res.sjson({
                        status: 200,
                        token: JWTToken
                    })
            }
            return res.sjson({
                status: 401,
                error: 'Unauthorized Access'
            })
        })
    })
    .catch(err => {
        res.sjson({
            status: 500,
            err,
        })
    })
})

export default router
