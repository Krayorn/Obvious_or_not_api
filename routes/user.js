import express from 'express'
import bcrypt from 'bcrypt'
import User from '../models/User'

const router = express.Router()

router.post('/', (req, res) => {
    bcrypt.hash(req.body.password, 10, (err, hash) => {
        if(err) {
            return res.status(500).json({
                err,
            })
        }
        else {
            const user = new User({
                username: req.body.username,
                password: hash
            })
            user.save().then((result) => {
                console.log(result)
                res.status(200).json({
                    success: 'New user has been created'
                })
            }).catch(err => {
                res.status(500).json({
                    err,
                })
            })
        }
    })
})

export default router
