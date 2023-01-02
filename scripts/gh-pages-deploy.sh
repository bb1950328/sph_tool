#!/usr/bin/env bash

BRANCH_NAME=$(git rev-parse --abbrev-ref HEAD)

git checkout --orphan gh-pages

npm run build

if [ -d "dist" ]; then
  DIR=dist
else
  DIR=build
fi

git --work-tree $DIR add --all
git --work-tree $DIR commit -m "gh-pages"
git push origin HEAD:gh-pages --force

rm -r $DIR

git checkout -f "$BRANCH_NAME"
git branch -D gh-pages
