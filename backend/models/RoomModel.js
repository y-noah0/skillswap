const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const RoomSchema = new Schema({
    skill_id: {
        type: String
    },
    users: {
        type: Array
    }
}, { timestamps: true })

const RoomModel = mongoose.model('Room', RoomSchema)

module.exports = RoomModel