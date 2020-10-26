import express, { json } from 'express'
import path from 'path'
import requestManager from './server/requestManager';
import stateRoutes from './server/stateRoutes'

const fs = require("fs");

const app = express()
const jsonParser = express.json();

function loadDataBase(callback){
    fs.readFile('./local/db.json', 'utf8', function (err,data) {
        if(err){
            return(console.log(err))
        }
        callback(data)
    })
}


//
loadDataBase(function(dbJson){
    var db = JSON.parse(dbJson)

    app.use(express.static('public'))
    app.use('/assets', express.static(path.resolve(__dirname, 'assets')))

    const PORT = process.env.PORT || 3000
    const HOSTNAME = '0.0.0.0'

    app.listen(PORT, HOSTNAME, () => {
        console.log(`the app is running on ${HOSTNAME}:${PORT}`)
    })

    stateRoutes(app)
    requestManager(app, jsonParser, db)
})