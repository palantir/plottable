#!/usr/bin/env bash

echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > .npmrc
chmod 0600 .npmrc
