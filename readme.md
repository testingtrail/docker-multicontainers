Fibonnaci using multiple containers
===================================

This is going to be an example of Docker using multiple containers. The idea is to make it very complicated just to see how to work with different things on the same app. 

Architecture
------------
* The app is going to be a React Application using Express
* The 'Values I have seen' section is gonna be stored in Postgres.
* The 'Calculated values' is going to be stored in Redis (volatile DB).
* There will be a separate NodeJS process called Worker that watches Redis for new indexes to show up. 

![Image description](https://github.com/jorgeautomation/Docker_multicontainers/blob/master/architecture.png)

Here's another view of the app's architecture:

![Image description](https://github.com/jorgeautomation/Docker_multicontainers/blob/master/architecture.png)

1 Creating the worker process (watches Redis for new indexes)
-------------------------------------------------------------

1. Add package.json, create the index.js and also the keys.json. More info commented in the files. 


2 Creating the Express server (serves as API layer)
-------------------------------------------------------------

1. Creates a folder 'server' which will have all the code for the Express server. The code in that folder is commented for better understanding.

3 Creating the react app
------------------------

1.  As of npm@5.2.0 we can now avoid this global install and instead use npx to generate the app on the fly to get the most current libraries and avoid many dependency conflicts. This is now the recommended way to generate an app with Create React App. So **instead of "npm install -g create-react-app' and 'create-react-app client' use npx create-react-app client** Documentation: https://create-react-app.dev/docs/getting-started#quick-start

2. Remember to run it in the root of the project, not inside 'server' or 'worker'. It will create a react app under 'client' directory

3. We are going to create a dummy page ('OtherPage.js') just to have routing and more robust front end example. Then we will create 'Fib.js'

4. Add Fib.js and OtherPage.js to App.js component
    - add react router dom and axios to the package.json
    - modify app.js by adding router imports, otherpage and Fib

4 Create DEV version of the client container
------------------------------

1. Create a 'Dockerfile.dev' It will be same as previous projects, copy package.json first, then evrything else and start react app with npm run start.

2. Run 'docker build -f Dockerfile.dev .' **inside client folder**

3. Run 'docker run <containeridfrompreviousstep> to check it is working as expected

