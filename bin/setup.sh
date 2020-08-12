#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "$0" )" && pwd )"

SETUP_FILES=( "$SCRIPT_DIR/../.ask/ask-states.json" "$SCRIPT_DIR/../skill-package/skill.json" "$SCRIPT_DIR/../.vscode/launch.json" )

for file in ${SETUP_FILES[@]}; do
  if [[ ! -f "$file" ]]; then
    cp $file.example $file
  fi
done

if ! command -v aws &> /dev/null; then
    echo "aws could not be found.  Please follow the instructions here: https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html."
    exit
fi

if ! aws secretsmanager get-secret-value --secret-id baby-buddy-alexa-skill > /dev/null 2>&1; then
  echo -n "Enter Baby Buddy server URL (e.g. https://babybuddy.url.com/): "

  read BABY_BUDDY_API_URL

  echo -n "Enter Baby Buddy API key: "

  read BABY_BUDDY_API_KEY

  aws secretsmanager create-secret --name baby-buddy-alexa-skill \  
      --description "Secrets for the Baby Buddy Alexa Skill." \
      --secret-string "{\"BABY_BUDDY_API_KEY\":\"$BABY_BUDDY_API_KEY\",\"BABY_BUDDY_API_URL\":\"$BABY_BUDDY_API_URL\"}"

  echo "Secrets have been added to AWS Secrets Manager under the key \"baby-buddy-alexa-skill\".  Please add the arn:aws:iam::aws:policy/SecretsManagerReadWrite role to the IAM policy found in ask-states.json."
fi