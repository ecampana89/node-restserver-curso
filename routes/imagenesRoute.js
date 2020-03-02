const express = require('express')
const fs = require('fs')
const path = require('path')
const {verifyTokenImg} = require('../server/middlewares/auth')

let app = express()

app.get('/imagen/:tipo/:img', verifyTokenImg, (req, res) => {
    let tipo = req.params.tipo
    let img = req.params.img
    let pathImg = path.resolve(__dirname, `../uploads/${tipo}/${img}`)
    if (fs.existsSync(pathImg)) {
        return res.sendFile(pathImg)
    } else {
        let noImgPath = path.resolve(__dirname, '../assets/original.jpg')
        return res.sendFile(noImgPath)
    }
})

module.exports = app
