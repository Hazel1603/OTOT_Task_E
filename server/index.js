const axios = require('axios')
const cors = require('cors')
const express = require("express");
const Redis = require('redis')
const fetch = require('node-fetch');

const redisClient = Redis.createClient()
redisClient.on('error', (err) => console.log('Redis redisClient Error', err));
redisClient.connect().then(() => console.log('Redis connection established.'))
    .catch(() => console.log('Redis connection failed.'))

const DEAFULT_EXPIRATION = 3600

const PORT = process.env.PORT || 3001;

const app = express();
app.use(express.urlencoded({extended: true}))
app.use(cors())

app.get("/api", (req, res) => {
    res.json({ message: "Hello from server!" });
});

app.get("/todos", async (req, res) => {
    const TODO = 'todos'

    const cacheResults = await redisClient.get(TODO);
    if (cacheResults) {
      res.json({cache: 'hit', data: JSON.parse(cacheResults)})
    } else {
        console.log('Cache Miss')
        fetch('https://jsonplaceholder.typicode.com/todos')
            .then(res => res.json())
            .then(json => {
                redisClient.setEx(TODO, DEAFULT_EXPIRATION, JSON.stringify(json))
                res.json({cache: 'miss', data: json})
        })
    }
});

app.get("/flush", async(req, res) => {
    redisClient.flushAll()
    res.json({status: 'success'})
})

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});
