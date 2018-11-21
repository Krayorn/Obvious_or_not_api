import express from 'express'
import bcrypt from 'bcrypt'
import User from '../models/User'
import jwt from 'jsonwebtoken'

const router = express.Router()

router.post('/', function(req, res){
    User.findOne({username: req.body.username}, (err, user) => {
        if (!user) {
            return res.status(401).json({
                failed: 'Unrecognised Username'
            })
        }
        bcrypt.compare(req.body.password, user.password, (err, result) => {
            if(err) {
                return res.status(401).json({
                    failed: 'Unauthorized Access'
                })
            }
            if(result) {
                const JWTToken = jwt.sign({
                        username: user.username,
                        _id: user._id
                    },
                    'secret',
                    {
                        expiresIn: '2h'
                    })

                    return res.status(200).json({
                        success: 'Welcome to the JWT Auth',
                        token: JWTToken
                    })
            }
            return res.status(401).json({
                failed: 'Unauthorized Access'
            })
        })
    })
    .catch(err => {
        console.log('catched?', err)
        res.status(500).json({
            err,
        })
    })
})

export default router
