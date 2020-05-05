const keys = require('./keys')
const redis = require('redis')

// passing an object inside createClient
const redisClient = redis.createClient({
    host: keys.redisHost,
    port : keys.redisPort,
    //following is to try to reconnect every second if we lose connection
    retry_strategy : () => 1000
})

// sub is for subscription, this is a duplicate
const sub = redisClient.duplicate()

// function to calculate Fibonacci, in a recursive way
function fib(index){
    if(index < 2) return 1
    return fib(index-1) + fib(index-2)
}

// anytime we get a new message run this callback function
sub.on('message', (channel, message) => {
    //adding into a hash in redis with key being the message and the value the calculation
    redisClient.hset('values', message, fib(parseInt(message)))
})

// anytime there is a new insert we take the value and calculate
sub.subscribe('insert')