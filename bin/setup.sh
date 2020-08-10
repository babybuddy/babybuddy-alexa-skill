#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "$0" )" && pwd )"

SETUP_FILES=( "$SCRIPT_DIR/../.ask/ask-states.json" "$SCRIPT_DIR/../skill-package/skill.json" "$SCRIPT_DIR/../.vscode/launch.json" )

for file in ${ASK_CLI_FILES[@]}; do
  if [[ ! -f "$file" ]]; then
    cp $file.example $file
  fi
done

DOT_ENV_FILE="$SCRIPT_DIR/../lambda/custom/.env"

if [[ ! -f $DOT_ENV_FILE ]]; then
  echo -n "Enter Baby Buddy server URL (e.g. https://babybuddy.url.com/): "

  read BABY_BUDDY_API_URL

  echo -n "Enter Baby Buddy API key: "

  read BABY_BUDDY_API_KEY

  echo "BABY_BUDDY_API_URL=$BABY_BUDDY_API_URL" >> $DOT_ENV_FILE
  echo "BABY_BUDDY_API_KEY=$BABY_BUDDY_API_KEY" >> $DOT_ENV_FILE
fi
