#!/usr/bin/env bash

echo "//registry.npmjs.org/:_authToken=${NPM_AUTH_TOKEN}" > .npmrc
chmod 0600 .npmrc
