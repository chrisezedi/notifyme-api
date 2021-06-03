#!/usr/bin/env bash
echo $1;
#login to heroku
# echo $1 | docker login --username=_ --password-stdin registry.heroku.com
# echo $1 | docker login --username=_ --password-stdin registry.heroku.com

# #tag docker image for heroku
# docker tag notifyme-api registry.heroku.com/notifyme-api/web

# #push docker image to heroku registry
# docker push registry.heroku.com/notifyme-api/web

# #release new container
# heroku container:release web -a notifyme-api

#1005b1ec-2adf-4c49-ad12-2d7aa5925ba3