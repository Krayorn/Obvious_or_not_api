import express from 'express'
import mongoose from 'mongoose'

import Survey from '../models/Survey'
import Vote from '../models/Vote'

const router = express.Router()

router.post('', (req, res) => {
    if (req.decoded._id !== process.env.IDADMIN) {
        return res.sjson({
            status: 403
        })
    }

    Survey.createFromBody(req.body, (err, survey) => {
        if (err) throw err

        res.sjson({
            status: 200,
            data: survey,
        })
    })
})

router.get('', (req, res) => {
    Survey.find({}).sort({ field: 'asc', _id: -1 }).limit(20)
    .then(surveys => {
        const optionsIds = []

        surveys.forEach((survey) => {
            survey.options.forEach(opt => {
                optionsIds.push(opt._id)
            })
        })

        return Vote.find({ option_id: { $in : optionsIds} })
        .then((allVotes) => {

            const detailedSurveys = surveys.map(survey => {
                let totalVotesSurvey = 0

                const hasVoted = allVotes.find((vote) => {
                    return vote.user_id == (req.decoded ? req.decoded._id : 0)
                        && vote.survey_id == survey._id
                }) || false

                let options = survey.options.map(opt => {
                    const optionsVotes = allVotes.filter(vote => {
                        return vote.option_id == opt._id
                    })

                    totalVotesSurvey += optionsVotes.length

                    let newOpt = {
                        _id: opt._id,
                        text: opt.text,
                        voteNumber: optionsVotes.length,
                        percentage: 0,
                        hasVoted: hasVoted ? hasVoted.option_id == opt._id : hasVoted
                    }

                    return newOpt
                }).map((opt) => {
                    return {...opt, percentage: (opt.voteNumber / totalVotesSurvey * 100) || 0}
                })

                return {
                    _id: survey._id,
                    title: survey.title,
                    content: survey.content,
                    explanation: survey.explanation,
                    options: options,
                    totalVotes: totalVotesSurvey,
                    hasVoted: !!hasVoted,
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
    const optionId = req.params.id

    Survey.findOne({
        'options._id': mongoose.Types.ObjectId(optionId)
    }).then((survey) => {

        Vote.find({survey_id: survey._id, user_id: req.decoded._id}).countDocuments()
        .then((voteCount) => {
            if (voteCount !== 0) {
                return res.sjson({
                    status: 403,
                    error: 'You already voted for that survey !'
                })
            }

            new Vote({
                user_id: mongoose.Types.ObjectId(req.decoded._id),
                survey_id: survey.id,
                option_id: mongoose.Types.ObjectId(optionId),
            }).save((err, vote) => {
                if (err) throw err
                res.sjson({
                    status: 200,
                    data: vote
                })
            })
        })
    })
})

export default router
