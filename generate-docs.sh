#!/bin/bash

version="$1"

if [[ "$version" == "" ]]; then
    echo "Must provide tag or branch name as argument, e.g. 'v0.23.2'"
    exit 1
fi

git checkout "$version" -- plottable.d.ts plottable.js src/ typings/ &&
./node_modules/typedoc/bin/typedoc docs.d.ts --out docs/ &&
git rm -rf src/ typings/ > /dev/null
