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


            const userId = req.decoded ? req.decoded._id : 0


            const detailedSurveys = surveys.map(survey => {
                let totalVotesSurvey = 0

                const hasVoted = allVotes.find(vote => {
                    return vote.user_id == userId && vote.survey_id == survey._id
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
                })

                options = options.map(opt => {
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

    Vote.find({option_id: optionId, user_id: req.decoded._id}).countDocuments()
    .then(voteCount => {
        if (voteCount !== 0) {
            return res.sjson({
                status: 403,
                data: 'You already voted for that survey !'
            })
        }

        Survey.findOne({
            'options._id': mongoose.Types.ObjectId(optionId)
        }).then(survey => {
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
