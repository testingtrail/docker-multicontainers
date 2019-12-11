Fibonnaci using multiple containers
===================================

This is going to be an example of Docker using multiple containers. The idea is to make it very complicated just to see how to work with different things on the same app. 

Architecture
------------
* The app is going to be a React Application.
* When user submits a value it will make a request to a Express Server serving as an API.
* The 'Values I have seen' section is gonna be stored in Postgres.
* The 'Calculated values' is going to be stored in Redis (volatile DB).
* There will be a separate NodeJS process called Worker that watches Redis for new indexes to show up. 

Steps
-----

1. Add package.json, create the index.js and also the keys.json