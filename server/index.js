const cors = require('cors')
const express = require("express");
const Redis = require('redis')
const fetch = require('node-fetch');
const mongoose = require('mongoose');

const redisClient = Redis.createClient()
redisClient.on('error', (err) => console.log('Redis redisClient Error', err));
redisClient.connect().then(() => console.log('Redis connection established.'))
    .catch(() => console.log('Redis connection failed.'))

const DEAFULT_EXPIRATION = 3600

mongoose.connect('mongodb://localhost/OTOT-E');
const Todo = require('./model');

const PORT = process.env.PORT || 3001;

const app = express();
app.use(express.urlencoded({extended: true}))
app.use(cors())

Todo.deleteMany({}, function(err) {
    if (err) {
        console.log(err);
    } else {
        console.log("seeding...")
        for (var count = 0; count <= 3; count ++) {
            fetch('https://jsonplaceholder.typicode.com/todos')
            .then(res => res.json())
            .then(json => {
                for (var i=0; i<json.length; i++){
                    currJson = json[i]
                    var currTodo = new Todo({userId: currJson.userId, id:currJson.id, title: currJson.title, completed: currJson.completed})
                    currTodo.save(function(err){
                        if(err){
                            console.log('error!',err);
                        }
                    });
                 }
            })
        }
    }
});

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

        Todo.get(function (err, todo) {
            if (err) {
                res.status(400).json({
                    status: "error",
                    message: err,
                });
                return;
            }
            // store in cache
            redisClient.setEx(TODO, DEAFULT_EXPIRATION, JSON.stringify(todo))

            res.json({cache: 'miss', data: todo});
        });
    }
});

app.get("/flush", async(req, res) => {
    redisClient.flushAll()
    res.json({status: 'success'})
})

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});
