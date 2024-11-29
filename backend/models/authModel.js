const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const skillModel = require("./SkillModel");
const RoomModel = require("./RoomModel"); // Import RoomModel

const authSchema = new mongoose.Schema({
  // Define your schema here
  username: {
    type: String,
    required: [true, "Please enter a username"],
  },
  first_name: {
    type: String,
    required: [true, "Please enter your first name"],
  },
  last_name: {
    type: String,
    required: [true, "Please enter your last name"],
  },
  email: {
    type: String,
    required: [true, "Please enter an email"],
  },
  password: {
    type: String,
    required: [true, "Please enter a password"],
  },
  skill: {
    type: String,
    required: [true, "Please enter a skill"],
  },
  desired_skill: {
    type: String,
    required: [true, "Please enter a desired skill"],
  },

});

// User registration method
authSchema.statics.signup = async function (
  username,
  first_name,
  last_name,
  email,
  password,
  skill,
  desired_skill
){

console.log(  username,first_name,  last_name,  email,  password,username_exists = await this.find({ username }));
  const email_exists = await this.find({ email });

  console.log(username_exists.length, email_exists.length);

  if (username_exists.length != 0 || email_exists.length != 0) {
    throw Error("username or email is already in use");
  }
try {
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(password, salt);

    const user = await this.create({
      username,
      first_name,
      last_name,
      email,
      password: hash,
      skill,
      desired_skill,
    });

    // Create skills if they do not exist
    await skillModel.findOneAndUpdate(
      { skill_name: skill },
      { skill_name: skill },
      { upsert: true, new: true }
    );

    await skillModel.findOneAndUpdate(
      { skill_name: desired_skill },
      { skill_name: desired_skill },
      { upsert: true, new: true }
    );

    // Create rooms for the skills if they do not exist
    await RoomModel.findOneAndUpdate(
      { skill_id: skill },
      { skill_id: skill, $addToSet: { members: user._id } },
      { upsert: true, new: true }
    );

  await RoomModel.findOneAndUpdate(  
      { skill_id: desired_skill },
      { skill_id: desired_skill, $addToSet: { members: user._id } },
      { upsert: true, new: true }
    );

    return user;
} catch (error) {
  console.log(error);
  
}
};

// User login method
authSchema.statics.login = async function (email, password) {
  const email_exists = await this.find({ email });
  if (email_exists.length == 0) {
    throw Error("wrong Email");
  } else {
    const user = email_exists[0];
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (passwordMatch) {
      return user;
    } else {
      throw Error("wrong password");
    }
  }
};

const User = mongoose.model("User", authSchema);
module.exports = User;
