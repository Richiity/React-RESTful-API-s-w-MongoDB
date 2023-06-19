require('dotenv').config()

const express = require('express')
const app = express();
const mongoose = require('mongoose')
const bodyParser = require('body-parser')

app.use(bodyParser.json())

mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser: true})
const db = mongoose.connection
db.on('error', (error)=> console.error(error))
db.once('open', () => console.log('Connected to Database'))

app.use(express.json())

app.get('/', (req,res) =>{
    res.send('This is homepage')
})

//Import routes
const plannerRouter = require('./routes/planner')
//Middleware
app.use('/planner',plannerRouter)

app.listen(3001, () => console.log('Server Started'))