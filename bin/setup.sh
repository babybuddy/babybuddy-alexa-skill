#!/bin/bash

set -e

SCRIPT_DIR="$( cd "$( dirname "$0" )" && pwd )"

SETUP_FILES=( 
  "$SCRIPT_DIR/../.ask/ask-states.json" 
  "$SCRIPT_DIR/../skill-package/skill.json" 
  "$SCRIPT_DIR/../.vscode/launch.json" 
  "$SCRIPT_DIR/../.vscode/tasks.json" 
  "$SCRIPT_DIR/../ask-resources.json" 
)

for file in ${SETUP_FILES[@]}; do
  if [[ ! -f "$file" ]]; then
    cp $file.example $file
  fi
done

CONFIG_FILE="$SCRIPT_DIR/../lambda/custom/.env"

if [[ ! -f $CONFIG_FILE ]]; then
  echo -n "Enter Baby Buddy server URL (e.g. https://babybuddy.url.com/): "

  read BABY_BUDDY_API_URL

  echo -n "Enter Baby Buddy API key: "

  read BABY_BUDDY_API_KEY

  touch $CONFIG_FILE

  cat > $CONFIG_FILE <<EOL
BABY_BUDDY_API_KEY=${BABY_BUDDY_API_KEY}
BABY_BUDDY_API_URL=${BABY_BUDDY_API_URL}
EOL
fi
