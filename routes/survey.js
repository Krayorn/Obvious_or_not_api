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
        const optionsIds = []

        surveys.forEach(survey => {
            survey.options.forEach(opt => {
                optionsIds.push(opt._id)
            })
        })

        return Vote.find({ option_id: { $in : optionsIds} })
        .then(allVotes => {

            const detailedSurveys = surveys.map(survey => {
                let totalVotesSurvey = 0

                let options = survey.options.map(opt => {
                    const optionsVotes = allVotes.filter(vote => {
                        return JSON.stringify(vote.option_id) == JSON.stringify(opt._id)
                    })
                    totalVotesSurvey += optionsVotes.length

                    let newOpt = {
                        _id: opt._id,
                        text: opt.text,
                        totalCount: optionsVotes.length,
                        percentage: 0
                    }

                    return newOpt
                })

                options = options.map(opt => {
                    return {...opt, percentage: (opt.totalCount / totalVotesSurvey * 100) || 0}
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
