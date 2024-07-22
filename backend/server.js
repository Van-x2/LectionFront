//express import/setup
const express = require('express')
const app = express()
//cors import/setup
const cors = require('cors')
app.use(cors())
//bodyparser middleware import/setup
const bodyParser = require('body-parser')
app.use(bodyParser.json())
//env import
require('dotenv').config()
//Mongo import
const { MongoClient, ServerApiVersion, ObjectId, $match, Db } = require('mongodb')
//Defining usefull variables
const PORT = process.env.PORT
const uri = process.env.mongoString
const client = new MongoClient(uri)
let playerJoincode;
let route





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
    playerJoincode = lobby.joincode
    let _id

    //Inserts the lobby object defined above and console.logs the result
    await activelobbies.insertOne(lobby).then(result => {
      console.log(`Added document with ID: ${result.insertedId}`)
      console.log(`Joincode of: ${lobby.joincode}`)
      _id = result.insertedId
    })

    //Responds to client with the created lobbies join code
    res.send({ joincode : lobby.joincode })

    let hostSepRouteLive = `/lobbyhost${lobby.joincode}`
    let clientSepRoute = `/joinlobby${lobby.joincode}`

    app.get(hostSepRouteLive, async (req, res) => {
      res.writeHead(200, {
        "Connection": "keep-alive",
        "Cache-Control": "no-cache",
        "Content-Type": "text/event-stream",
      })
      res.flushHeaders()

      let currentPolledLobby
      let lastPolledLobby

      setInterval(async () => {
        //only take the 'prompts' & 'participants' field from the db
        currentPolledLobby = await activelobbies.findOne(
          {joincode: lobby.joincode},
          { projection: { participants: 1, prompts: 1, _id: 0 } }
        ).catch(() => {console.log(currentPolledLobby);})
        //If there is a difference between the currently polled data vs the last polled data do something
        if((JSON.stringify(currentPolledLobby) !== JSON.stringify(lastPolledLobby))) {
          if(currentPolledLobby == null) {
          console.log('null')
          }
          else{
            console.log('Change:', currentPolledLobby)
            res.write(`data:${JSON.stringify(currentPolledLobby)}\n\n`)
          }
          
          //reasign lastPolledLobby
          lastPolledLobby = currentPolledLobby
        }
      }, 3000)

      res.on('close', () => {
        res.end
      })
    })

    app.post(clientSepRoute, async (req, res) => {
      res.send('received')
      statusStatus = await activelobbies.findOne(
        {joincode: lobby.joincode},
        { projection: { status: 1, _id: 0 } }
      )
      .then(response => {
        console.log
        if(response.status >= 2) {
          res.send('Cannot join a lobby mid-game')
        }
        else{



          console.log(req.body)
          const participantBody = {
            name: req.body.name,
            responses: []
          }
          activelobbies.updateOne({joincode: lobby.joincode}, {$push: {participants: participantBody}})

          let clientSepRouteLive = `/lobbyclient${lobby.joincode}${req.body.name}`
          console.log(clientSepRouteLive)



          app.get(clientSepRouteLive, async (req, res) => {
            res.writeHead(200, {
              "Connection": "keep-alive",
              "Cache-Control": "no-cache",
              "Content-Type": "text/event-stream",
            })
            res.flushHeaders()



            let currentPolledLobby
            let lastPolledLobby

            setInterval(async () => {
              //only take the 'prompts' & 'participants' field from the db
              currentPolledLobby = await activelobbies.findOne(
                {joincode: lobby.joincode},
                { projection: { prompts: 1, _id: 0 } }
              ).catch(() => {console.log(currentPolledLobby);})
              //If there is a difference between the currently polled data vs the last polled data do something
              if((JSON.stringify(currentPolledLobby) !== JSON.stringify(lastPolledLobby))) {
                if(currentPolledLobby == null) {
                console.log('null')
                }
                else{
                  console.log('Change:', currentPolledLobby)
                  res.write(`data:${JSON.stringify(currentPolledLobby)}\n\n`)
                }
                
                //reasign lastPolledLobby
                lastPolledLobby = currentPolledLobby
              }
            }, 3000)




            res.on('close', () => {
              res.end
            })
          })





        }
      })
    })
    

    }

uploadLobby().catch(console.error)
})

app.post('/test', (req, res) => {
console.log('received')
res.send('response')
})




app.listen(PORT, () => {
    console.log(`server listening on port: ${PORT}`)
})