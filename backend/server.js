//express import/setup
const express = require('express')
const app = express()
//cors import/setup
const cors = require('cors')
app.use(cors())
//bodyparser middleware import/setup
const bodyParser = require('body-parser')
app.use(bodyParser.json())
//WebSocket import/setup
const expressWs = require('express-ws')(app)
//env import
require('dotenv').config()
//Mongo import
const { MongoClient, ServerApiVersion, ObjectId, $match, Db } = require('mongodb')
//Defining usefull variables
const PORT = process.env.PORT
const uri = process.env.mongoString
const client = new MongoClient(uri)




app.post('/createlobby', (req, res) => {
//defines lobby object taken from request body
const lobby = req.body

//uploads prepped lobby data to MongoDB 'activelobbies' collection
async function uploadLobby() {
    let joincode
    //connect to MongoDB
    await client.connect()
    console.log('Connected to MongoDB')

    //gets the desired db and collection from Mongo
    const LectionData = client.db('LectionData')
    const activelobbies = LectionData.collection('activelobbies')

    //creates unique joincode
    async function createJoinCode() {
        let unique = false
        while(!unique) {
        joincode = Number((Math.floor(Math.random() * 1000000)).toString().padStart(6, '0'))
        
        const count = await activelobbies.countDocuments({ joincode: joincode })
        unique = count === 0
        }
        return joincode
    }
    //adds the unique joincode to the lobby object
    lobby.joincode = await createJoinCode()

    let _id

    //Inserts the lobby object defined above and console.logs the result
    await activelobbies.insertOne(lobby).then(result => {
      console.log(`Added document with ID: ${result.insertedId}`)
      console.log(`Joincode of: ${lobby.joincode}`)
      _id = result.insertedId
    })

    //Responds to client with the created lobbies join code
    res.send({ joincode : lobby.joincode })

    //Spins up a WebSocket after the lobby has been created, to communicate in real time with the host client
    app.ws('/', (ws, req) => {
      ws.on('message', (msg) => {
        console.log(msg)
        ws.send(JSON.stringify(lobby))
      })
    })

    }

uploadLobby().catch(console.error)
})

app.listen(PORT, () => {
    console.log(`server listening on port: ${PORT}`)
})