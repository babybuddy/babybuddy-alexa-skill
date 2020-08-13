#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "$0" )" && pwd )"

cd $SCRIPT_DIR/../lambda/custom
yarn build

zip -r $SCRIPT_DIR/../lambda/custom/build.zip $SCRIPT_DIR/../lambda/custom/.build > /dev/null 2>&1
