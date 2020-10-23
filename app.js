import express from 'express'
import path from 'path'
import stateRoutes from './server/stateRoutes'

const app = express()

app.use(express.static('public'))
app.use('/assets', express.static(path.resolve(__dirname, 'assets')))

const PORT = process.env.PORT || 3000
const HOSTNAME = '0.0.0.0'

app.listen(PORT, HOSTNAME, () => {
    console.log(`the app is running on ${HOSTNAME}:${PORT}`)
})

stateRoutes(app)
