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

export default mongoose.model('Survey', SurveySchema)
