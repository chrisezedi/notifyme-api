#!/usr/bin/env bash
echo "FROM DEPLOY"
echo $1
#login to heroku
# echo $1 | docker login --username=_ --password-stdin registry.heroku.com

# #tag docker image for heroku
# docker tag notifyme-api registry.heroku.com/notifyme-api/web

# #push docker image to heroku registry
# docker push registry.heroku.com/notifyme-api/web

# #release new container
# heroku container:release web -a notifyme-api
# © 2021 GitHub, Inc.