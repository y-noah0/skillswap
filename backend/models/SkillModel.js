const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const skillSchema = new Schema({
  skill_name: {
        type: String,
        required: [true, "the skill field is required"],
  },
});

const Skill = mongoose.model('Skill', skillSchema);

module.exports = Skill