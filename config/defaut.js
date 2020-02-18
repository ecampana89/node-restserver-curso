require('dotenv').config()
// PUERTO
process.env.PORT = process.env.PORT || 3000

// ENTORNO
process.env.NODE_ENV = process.env.NODE_ENV || 'dev'

// Base de datos
let urlDb
let optionsDB
if (process.env.NODE_ENV === 'dev') {
    urlDb = 'mongodb://localhost:27017/cafe'
    optionsDB = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true
    }
} else {
    urlDb = process.env.MONGO_URI
    optionsDB = {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
}

let auth = {
    secret: process.env.SEED || 'lacola1234',
    tokenExpire: 86400
}


module.exports = {process, urlDb, optionsDB, auth}
