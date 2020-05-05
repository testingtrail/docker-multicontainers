// this is an object which will store the host and port for redis
// from environment variables
module.exports = {
    redisHost: process.env.REDIS_HOST,
    redisPort: process.env.REDIS_PORT
} 