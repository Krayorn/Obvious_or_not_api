import mongoose from 'mongoose'

const SurveySchema = mongoose.Schema({
    title: {type: String, required: true},
    content: {type: String, required: true},
    options: [
        {
            text: { type: String },
        }
    ],
    explanation: { type: String, required: true }
})


SurveySchema.statics.createFromBody = (body, cb) => {
    return new Survey({
        title: body.title,
        content: body.content,
        options: body.options,
        explanation: body.explanation,
    }).save(cb)
}

const Survey = mongoose.model('Survey', SurveySchema)

export default Survey
