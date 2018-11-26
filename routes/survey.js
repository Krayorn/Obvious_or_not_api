import express from 'express'
import Survey from '../models/Survey'

const router = express.Router()

router.post('', (req, res) => {

    const { title, content, explanation } = req.body
    const options = JSON.parse(req.body.options)

    if (req.decoded._id !== process.env.IDADMIN) {
        res.sjson({
            status: 403
        })
    } else {
        new Survey({
            title,
            content,
            options,
            explanation,
        }).save((err, survey) => {
            if (err) throw err

            res.sjson({
                status: 200,
                data: survey,
            })
        })
    }
})

router.get('', (req, res) => {
    Survey.find({}).sort({ field: 'asc', _id: -1 }).limit(20)
    .then(surveys => {
        res.sjson({
            status: 200,
            surveys,
        })
    })
})

export default router
