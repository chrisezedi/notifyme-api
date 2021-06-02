#!/usr/bin/env bash
#build docker image
docker build -t notifyme-api .

#login to docker
docker login -u $DOCKER_USER -p $DOCKER_PASSWORD

#tag image
docker tag notifyme-api $DOCKER_USER/notifyme-api:$TRAVIS_BUILD_NUMBER
docker tag notifyme-api $DOCKER_USER/notifyme-api:latest

#push docker image to dockerhub
docker push $DOCKER_USER/notifyme-api:latest

#tag docker image for heroku
docker tag notifyme-api registry.heroku.com/notifyme-api/web

#push docker image to heroku registry
docker push registry.heroku.com/notifyme-api/web

#release new container
heroku container:release web -a notifyme-api
