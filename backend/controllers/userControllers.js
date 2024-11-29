const User = require("../models/authModel");
const jwt = require("jsonwebtoken");

// Function to handle user signup
async function post_signup(req, res) {
  const secret_key = "Mugisha";
  const {
    username,
    first_name,
    last_name,
    email,
    password,
    skill,
    desired_skill,
  } = req.body;

  try {
    const user = await User.signup(
      username,
      first_name,
      last_name,
      email,
      password,
      skill,
      desired_skill
    );
    const token = jwt.sign({ id: user._id }, secret_key, { expiresIn: "48h" });
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: true,
      maxAge: 3600000 * 48,
    });
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// Function to handle user signin
async function post_signin(req, res) {
  const { email, password } = req.body;
  const secret_key = "Mugisha";
  try {
    const user = await User.login(email, password);
    const token = jwt.sign({ id: user._id }, secret_key, { expiresIn: "48h" });
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: true,
      maxAge: 3600000 * 48,
    });
    res.status(200).json({ user });
  } catch (error) {
    res.json({ error: error.message });
  }
}
// Function to get user by ID
async function get_user_by_id(req, res) {
  const userId = req.params.id;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// Middleware to authenticate JWT
async function authanticateJwt(req, res, next) {
  const token = req.cookies.jwt;
  const secret_key = "Mugisha";
  if (token) {
    const verifies = await jwt.verify(token, secret_key);
    if (verifies) {
      req.user = await User.find({ _id: verifies.id });
      console.log(req.user);
      next();
    }
  } else {
    res.status(403).json({ msg: "your unauthorized" });
  }
}

// Function to handle user logout
function logout(req, res) {
    res.cookie("jwt", "", { maxAge: 1 });
    res.status(200).json({ message: "Logged out successfully" });
}

module.exports = {
  post_signup,
  post_signin,
  authanticateJwt,
  logout,
  get_user_by_id,
};