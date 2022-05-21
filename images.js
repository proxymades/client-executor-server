const path = require('path')
const express = require('express')
const app = express()
const cors = require('cors')
const dir = path.join(__dirname, 'public')

app.use(cors({
    origin: 'http://localhost:3000'
}))

app.use(express.static(dir))

app.listen(5001, function () {
    console.log('Listening on http://localhost:5001/')
})