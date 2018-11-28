import mongoose from 'mongoose'

const VoteSchema = mongoose.Schema({
    user_id: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    survey_id: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    option_id: {
        type: mongoose.Types.ObjectId,
        required: true
    },
})

export default mongoose.model('Vote', VoteSchema)
