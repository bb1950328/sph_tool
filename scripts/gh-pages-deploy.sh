#!/usr/bin/env bash

GITHUB_URL=$(git config --get remote.origin.url)

npm run build
if [ -d "dist" ]; then
  DIR=dist
else
  DIR=build
fi
BUILD_OUTPUT_DIR="$(pwd)/$DIR"

rm -rf /tmp/gh-pages-build # in case the previous run didn't finish
mkdir /tmp/gh-pages-build
pushd /tmp/gh-pages-build || exit
git clone --single-branch --branch gh-pages "$GITHUB_URL"
pushd sph_tool || exit

rm -rf ./*
cp -R "$BUILD_OUTPUT_DIR/." .

git status

git add .
git commit -m "gh-pages"
git push --force

popd || exit
popd || exit
rm -rf /tmp/gh-pages-build
