import express from 'express'
import mongoose from 'mongoose'

import Survey from '../models/Survey'
import Vote from '../models/Vote'

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
        const promiseArray = []
        surveys.forEach(survey => {
            survey.options.forEach(opt => {
                promiseArray.push(Vote.find({option_id: opt._id}).countDocuments())
            })
        })

        return Promise.all(
            promiseArray
        )
        .then(([...allCounts]) => {
            let i = 0

            const detailedSurveys = surveys.map(survey => {

                const totalVotesSurvey = allCounts.slice(i, i + survey.options.length).reduce((a, b) => a + b)

                const options = survey.options.map(opt => {
                    let newOpt = {
                        _id: opt._id,
                        text: opt.text,
                        totalCount: allCounts[i],
                        percentage: (allCounts[i] / totalVotesSurvey * 100) || 0
                    }
                    i++

                    return newOpt
                })

                return {
                    _id: survey._id,
                    title: survey.title,
                    content: survey.content,
                    explanation: survey.explanation,
                    options: options
                }
            })

            res.sjson({
                status: 200,
                data: detailedSurveys,
            })
        })
    })
})

router.post('/:id', (req, res) => {
    Survey.findOne({
        'options._id': mongoose.Types.ObjectId(req.params.id)
    }).then(survey => {
        new Vote({
            user_id: mongoose.Types.ObjectId(req.decoded._id),
            survey_id: survey.id,
            option_id: mongoose.Types.ObjectId(req.params.id),
        }).save((err, vote) => {
            if (err) throw err
            res.sjson({
                status: 200,
                data: vote
            })
        })
    })
})

export default router
