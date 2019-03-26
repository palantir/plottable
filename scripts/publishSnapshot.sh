#!/usr/bin/env bash

GIT_DESCRIBE=`git describe --tags --match "*-dev"`
# set package.json version
npm --no-git-tag-version version $GIT_DESCRIBE
yarn dist
npm publish --tag next
