const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;
const skillModel = require("./Skills")
const authSchema = new Schema({
  username: {
    type: String,
    required: [true, "the username field is required"],
  },
  first_name: {
    type: String,
    required: [true, "the first_name field is required"],
  },
  last_name: {
    type: String,
    required: [true, "the last_name field is required"],
  },
  email: {
    type: String,
    required: [true, "the email field is required"],
  },
  password: {
    type: String,
    required: [true, "the password field is required"],
    minlength: [6, "password must be 6 charcters at minmum"],
  },
  skill: {
    type: String,
    required: [true, "the skill field is required"],
  },
  desired_skill: {
    type: String,
    required: [true, "the desired skill field is required"],
  }
});

authSchema.statics.signup = async function (body) {
  const { username, first_name, last_name, email, password,skill,desired_skill } =
    body;
  const username_exists = await this.find({ username });
  const email_exists = await this.find({ username });

  console.log(username_exists.length, email_exists.length);

  if (username_exists.length != 0 || email_exists.length != 0) {
    throw Error("username or email is arleady in use");
  }
  const salt = await bcrypt.genSalt();
  const hash = await bcrypt.hash(password, salt);

  const user = this.create({
    username,
    first_name,
    last_name,
    email,
    password: hash,
    skill,
    desired_skill,
  });
  const skills = skillModel.create({skill_name: skill});
  return user;
};
authSchema.statics.login = async function (email, password) {
  const email_exists = await this.find({ email });
  if (email_exists.length == 0) {
    throw Error("wrong Email ");
  } else {
    user = email_exists[0];
    password = bcrypt.compare(password, user.password);
    if (password) {
      return user;
    } else {
      throw Error("wrong  password");
    }
  }
};

const authModel = mongoose.model("User", authSchema);
module.exports = authModel;
