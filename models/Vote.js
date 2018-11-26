import mongoose from 'mongoose'

const VoteSchema = mongoose.Schema({
    user_id: {
        type: String,
        required: true
    },
    survey_id: {
        type: String,
        required: true
    },
    option_id: {
        type: Number,
        required: true
    },
})

export default mongoose.model('Vote', VoteSchema)
