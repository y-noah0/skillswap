const express = require('express')
const app = express()
const cookieParser = require('cookie-parser')
const mongoose = require('mongoose')
const authRoutes = require('./routes/auth')
const ChatRoutes = require('./routes/ChatRoutes')
const userRoutes = require('./routes/userRoutes')
const MessageRoutes = require('./routes/MessageRoutes')
mongoose.connect("mongodb://localhost:27017/skillswap").then((res) => {
    app.listen(3000, () => {
        console.log('listening to port: 3000');
    })
})


app.set('view engine', 'ejs')

app.use(express.static('static'))
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())
app.use(express.json())


app.use(authRoutes);
app.use('/chat',ChatRoutes);
app.use('/message', MessageRoutes);
app.use(userRoutes)
