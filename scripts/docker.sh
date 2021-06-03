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