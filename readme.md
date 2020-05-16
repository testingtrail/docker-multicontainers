Fibonnaci using multiple containers
===================================

This is going to be an example of Docker using multiple containers. The idea is to make it very complicated just to see how to work with different things on the same app. 

Architecture
------------
* The app is going to be a React Application using Express
* The 'Values I have seen' section is gonna be stored in Postgres.
* The 'Calculated values' is going to be stored in Redis (volatile DB).
* There will be a separate NodeJS process called Worker that watches Redis for new indexes to show up. 

![Image description](https://github.com/jorgeautomation/Docker_multicontainers/blob/master/images/architecture.png)

Here's another view of the app's architecture:

![Image description](https://github.com/jorgeautomation/Docker_multicontainers/blob/master/images/architecture2.png)

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


5 Create DEV version of the server container
------------------------------

1. Create a 'Dockerfile.dev' It will be same as for the client folder, copy package.json first, then evrything else and the only thing changin is adding nodemon as starting command. Nodemon looks for changes in the project and refresh it automatically if it finds something changes

2. Run 'docker build -f Dockerfile.dev .' **inside client folder**

3. Run 'docker run <containeridfrompreviousstep> to check it is working as expected

6 Create DEV version of the worker container
------------------------------

1. Create a 'Dockerfile.dev' It will be same as for the client and server folder, copy package.json first, then evrything else and the only thing changin is adding nodemon as starting command. Nodemon looks for changes in the project and refresh it automatically if it finds something changes

2. Run 'docker build -f Dockerfile.dev .' **inside client folder**

3. Run 'docker run <containeridfrompreviousstep> to check it is working as expected


7 Putthing together the docker compose file
-----------------------------------------

1. Stop all the created running containers

2. Here's how it will work

![Image description](https://github.com/jorgeautomation/Docker_multicontainers/blob/master/images/architecture3.png)

3. create a file in root called docker-compose.yml
    - for postgres use the docker hub image with the latest tag
    - POSTGRES_PASSWORD=postgres_password (is mandatory now for postgres container)
    - Add redis service.
    - Add the service for the server which is our server folder, the context will be the path of the server folder
    - put a hole in /app/node_modules so the docker compose does not change nothin in there
    - add ./server:/app so each time there is a change in the server folder it will automatically be reflected in the app folder 

4. There is a keys.js where there is bunch of environment variables, those are the ones we have to send from the docker compose file
    - If you don't put a value to the variables then it will take the value of that variable from your computer
    - REDIS_HOST: put redis and it will understand it is the service with the same name in the file
    - REDIS_PORT: take a look to docker hub documentation for redis and you will see the port
    - for the postgres variables you do the same, go to docker hub documentation

5. Add the services for worker and client, pretty much the same as the server container


8 Why having Nginx
------------------

As of now we have pages for the react server and we have API requests that go to the Express server and right now we don't have anything that route both servers, so Nginx wil take those requests and route them properly

![Image description](https://github.com/jorgeautomation/Docker_multicontainers/blob/master/images/architecture4.png)

1. Create 'default.conf' to configure Nginx to work with the upstream servers (React and Express), upstream servers are servers behind Nginx
    - The line 'rewrite /api/(.*) /$1 break;' means: apply a regex that fullfill that and remove the /api, because in the server we have without /api, like 'app.get('/values/current', async...'

![Image description](https://github.com/jorgeautomation/Docker_multicontainers/blob/master/images/architecture5.png)

2. We will creater the Dockerfile for nginx
    - Copy the conf file and overwrite the default in the container

3. Add the nginx to docker compose file
    - This is the only one with ports mapping as nginx will route all the other ports internally in the default.conf

9 Running the app
-----------------

1. It is likely the app will throw some errors when doing docker-compose up --build, so then enter docker-compose down and run it again

2. If you open the chrome dev tools in console tab, you will see an error of the web socket basically because nginx wants an active connection to the react server, so what you can do is add what is inside here 'location /sockjs-node {...}' in default.conf for nginx

3. Check the console in dev tools for more issues for example this one: 
    - 504 bad gateway connection postgress: Uodate the pg dependency inside package.json file in server folder


10 On our way to deployment to production
-----------------------------------------

We are going to now to deploy to production, we are going to use Travis as our CD/CI and then upload the built prod to Dockerhub, and from there we can upload to any cloud service, in this case AWS Elastic Beanstalk

![Image description](https://github.com/jorgeautomation/Docker_multicontainers/blob/master/images/architecture6.png)


1. Add production dockerfile for Worker

2. Add production dockerfile for Server

3. Add production dockerfile for Nginx

4. Now we are going to have to Nginx server, the first which is the one we already have which routes to react or express servers. **The new nginx will be to host the react app in production environment**
    - Create a folder Nginx inside the client folder and create a file default.conf that will point to port 3000 (react), check where the files are and tell which index file open as default.

![Image description](https://github.com/jorgeautomation/Docker_multicontainers/blob/master/images/architecture7.png)

5. Add production dockerfile for Client
    - we need to create the build folder from react
    = we need to create the default.conf file from nginx
    - we need to copy the build folder into the nginx html path


11 Travis configuration and Dockerhub
-------------------------------------

![Image description](https://github.com/jorgeautomation/Docker_multicontainers/blob/master/images/architecture8.png)

1. Create a git repository (if you clone this one on yours you already did this step)

2. Go to your Travis account (https://travis-ci.com/) if you don't have create one.
    - In your profile select the repository and then go to the dashboard to the selected repo.

3. **Configure the travis.yml file**
    - Create a .travis.yml
    - Your username from builded image tag have to be the same as your doker login. Example docker build -t {DOCKER_ID}/multi-client ./client
    - We are going to use de dev version of the Dockerfile as the prod version is just the build and do not allow to perform tests
    - After success we will create imagers using the production dockerfile

4. Put the images to docker hub
    - Log in to the docker CLI if you are not. (docker login)
    - Go to travis, to you project and more options -> settings
    - Create two variables DOCKER_ID and DOCKER_PASSWORD with your credentials

5. Commit and push to your repository to see if your script worked, then go to dockerhub to see
your files