const keys = require('./keys')

// Express app setup
// *****************
const express = require('express')
const bodyParser = require ('body-parser')
const cors = require('cors')

const app = express()
// cross origin resource sharing, allows to make request to one domaing to a completely 
// different domain
app.use(cors())
// parse incoming request from the app and turn them into a json value
app.use(bodyParser.json())


// Postgres client setup
// *****************

// require the Pool module
 const { Pool } = require('pg')
 // passimg an object with different keys
 const pgClient = new Pool ({
     user: keys.pgUser,
     host: keys.pgHost,
     database: keys.pgDatabase,
     password: keys.pgPassword, 
     port: keys.pgPort
 })
// listener for error connection
 pgClient.on('error', () => console.log('Lost PG connection'))

 // creates the table in postgres, if failed shows an error
 pgClient.query('CREATE TABLE IF NOT EXISTS values (number INT)')
    .catch(err => console.log(err))


// Redis client setup up
// *****************

const redis = require('redis')
// passimg an object with different keys
const redisClient = redis.createClient ({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000
})

// we use duplicates as per Redis documentation requires for Javascript
const redisPublisher = redisClient.duplicate()


// Express route handlers
// *****************

// handler when entering to the express app
app.get('/', (req, res) => {
    res.send('Hi')
})

// handler for postgres, async function
app.get('/values/all', async (req, res) => {
    const values = await pgClient.query('Select * from values')
    // with rows we make sure just sent the useful informatkon in this case
    res.send(values.rows)
})

// handler for redis, async function
app.get('/values/current', async (req, res) => {
    //from the hashmap values, get all the indexes
    // we cannot use await here because refis for node does not have promises
    // so we cannot use, we have to use a callback function
    redisClient.hgetall('values', (err, values) => {
        res.send(values)
    })
})


// rout handler to receive new values from react app
app.post('/values', async (req, res) => {
    // get the value from the html body
    const index = req.body.index

    // make sure the index is < 40, so it won't take decades to return value
    if(parseInt(index)>40){
        return res.status(422).send('Index too high')
    }

    // take the value and put it in redis, but without yet calculating the value
    redisClient.hset('values', index, 'Nothing yet!')

    // this is the one that will wake up the worker and do the calculation
    redisPublisher.publish('insert', index)

    // add the new index in postgres
    pg.Client.query('INSERT INTO values(number) VALUES($1)', [index])

    // send a response
    res.send ({working: true})

})

// listener for the express app
app.listen(5000, () => {
    console.log('Listening on port 5000')
})