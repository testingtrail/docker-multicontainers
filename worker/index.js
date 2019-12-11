const keys = require('./keys')
const redis = require('redis')

const redisClient = redis.createClient({
    host: keys.redisHost,
    port : keys.redisPort,
    //following is to try to reconnect every second if we lose connection
    retry_strategy : () => 1000
})

//sub is for subscription
const sub = redisClient.duplicate()

function fib(index){
    if(index < 2) return 1
    return fib(index-1) + fib(index-2)
}

sub.on('message', (channel, message) => {
    redisClient.hset('values', message, fib(parseInt(message)))
})

sub.subscribe('insert')