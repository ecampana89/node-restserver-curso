require('./config/config')
const express = require('express')
const bodyParser = require('body-parser')
const app = express()

app.use(bodyParser.urlencoded({extended: false, limit: '5mb'}))
app.use(bodyParser.json({limit: '5mb', type: 'application/json'}))
app.use(bodyParser.text({limit: '1mb', type: 'application/octet-stream'}))

app.get('/', function (req, res) {
    const respuesta = {text: "Hola Mundo!"}
    res.json(respuesta)
})

app.get('/usuario', function (req, res) {
    const respuesta = {text: "get usuario!"}
    res.json(respuesta)
})

app.post('/usuario', function (req, res) {
    let body = req.body
    if (!body.nombre) {
        res.status(400).json({message: "El nombre es necesario"})
    } else {
        const respuesta = {mesagge: "post", body}
        res.json(respuesta)
    }
})

app.put('/usuario/:id', function (req, res) {
    let id = req.params.id
    let usuario = {id}
    const respuesta = {mesagge: "put", usuario}
    res.json(respuesta)
})

app.delete('/usuario/:id', function (req, res) {
    let id = req.params.id
    let usuario = {id}
    const respuesta = {mesagge: "delete", usuario}
    res.json(respuesta)
})

app.listen(process.env.PORT, () => {
    console.log('Escuchando el puerto:', process.env.PORT)
})
