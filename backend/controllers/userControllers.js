const User = require('../models/authModel')
const jwt = require('jsonwebtoken')

async function post_signup(req,res) {
    const secret_key = "Mugisha";
    try {
        const user = await User.signup(req.body)
        const token = jwt.sign({ id: user._id }, secret_key, { expiresIn: '48h' })
        res.cookie('jwt', token, {
            httpOnly: true,
            secure: true,
            maxAge: 3600000*48
        })
        res.status(200).json(user)
    } catch (error) {
        res.status(400).json({'error':error.message})
    }
}


async function post_signin(req, res) {
    const { email, password } = req.body
    const secret_key = "Mugisha";
    try {
        const user = await User.login(email, password)

        const token = jwt.sign({ id: user._id }, secret_key, {
            expiresIn: "48h",
        });

        res.cookie("jwt", token, {
            httpOnly: true,
            secure: true,
            maxAge: 3600000 * 48,
        });

        res.status(200).json({ user });
        
    } catch (error) {
        res.json({error : error.message})
    }
}

async function authanticateJwt(req,res,next) {
    const token = req.cookies.jwt
    const secret_key = 'Mugisha'
    if (token) {
        const verifies = await jwt.verify(token, secret_key)
        if (verifies) {
            req.user = await User.find({_id:verifies.id})
            console.log(req.user);
            next()
        }
    }
    else {
        res.status(403).json({msg:'your unauthorized'})
    }
}

function home(req,res) {
    res.json({msg:'this is the home page'})
}

function logout(req,res) {
    res.cookie('jwt','',{maxAge:-1})
    res.json({msg:'your have logged out'})
}

async function getUser(req, res) {
    try {
        
        const user = await User.find({ _id: req.params.userId })
        res.json(user)
    } catch (error) {
        res.status(500).json(error.message)
    }
    
}

module.exports = {
    home,
    post_signup,
    authanticateJwt,
    logout,
    post_signin,
    getUser,
 
}