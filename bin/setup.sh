#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "$0" )" && pwd )"

ASK_CLI_FILES=( "$SCRIPT_DIR/../.ask/ask-states.json" "$SCRIPT_DIR/../skill-package/skill.json" )

for file in ${ASK_CLI_FILES[@]}; do
  if [[ ! -f "$file" ]]; then
    cp $file.example $file
  fi
done
