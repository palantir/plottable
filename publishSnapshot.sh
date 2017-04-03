#!/usr/bin/env bash

GIT_DESCRIBE=`git describe --tags`

if [ `git describe --tags --abbrev=0` == $GIT_DESCRIBE ]
then
  echo "Cannot snapshot publish concrete version ${GIT_DESCRIBE}"
  exit 1
else
  # set package.json version
  npm --no-git-tag-version version $GIT_DESCRIBE
  yarn dist
  npm publish --tag next
fi
