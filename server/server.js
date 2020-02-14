const config = require('./config/defaut')
const express = require('express')
const mongoose = require('mongoose');
const bodyParser = require('body-parser')


const app = express()

app.use(bodyParser.urlencoded({extended: false, limit: '5mb'}))
app.use(bodyParser.json({limit: '5mb', type: 'application/json'}))
app.use(bodyParser.text({limit: '1mb', type: 'application/octet-stream'}))

app.use(require('./routes/usuarioRoute'))

app.get('/', function (req, res) {
    const respuesta = {text: "Hola Mundo!"}
    res.json(respuesta)
})

mongoose.connect(config.urlDb, config.optionsDB, (err, res) => {
    if (err) throw err
    console.log('Base de datos online')
})


app.listen(process.env.PORT, () => {
    console.log('Escuchando el puerto:', process.env.PORT)
})
