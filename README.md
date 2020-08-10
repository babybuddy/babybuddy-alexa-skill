# babybuddy-alexa-skill

## Introduction

This is an Alexa skill to help supplement the [Baby Buddy](https://github.com/babybuddy/babybuddy) server and allow users to record diaper changes, feedings, tummy times, etc. with their voice.

## Dependencies

This project depends on the [ask-cli](https://github.com/alexa/ask-cli) for deployment to AWS.  Please follow the instructions [here](https://github.com/alexa/ask-cli).

Also, [install yarn](https://yarnpkg.com/getting-started/install) for dependency management.

Note:  The ask-cli cannot be installed using yarn and has to be installed using npm.

## Setup

1. Clone the project locally
2. Run the following commands:

```
cd lambda/custom
yarn
yarn setup # Will prompt for Baby Buddy URL and API key
```

## Deployment

The ask-cli deploy command will automatically create the skill on your AWS account and a lambda function.  This needs to be done first in order to get local development to work.

```
ask deploy
```

## Local Development

The setup script will create a VSCode launch.json file to use for local development.  Developers can use something like [ngrok](https://ngrok.com/download) to redirect requests to their local dev instance for debugging.  Just update the Endpoint section on the Build tab at [developer.amazon.com](https://developer.amazon.com) to use the ngrok URL.