#!/bin/bash

version="$1"

if [[ "$version" == "" ]]; then
    echo "Must provide tag or branch name as argument, e.g. 'v0.23.2'"
    exit 1
fi

git checkout "$version" -- plottable.d.ts typings/ &&
./node_modules/typedoc/bin/typedoc --includeDeclarations typings/d3/d3.d.ts plottable.d.ts --out docs/ &&
git rm -rf typings/ > /dev/null
