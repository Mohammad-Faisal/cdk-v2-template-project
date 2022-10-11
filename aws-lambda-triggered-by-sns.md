# Aws Lambda triggered by aws sns

## Introduction

This is a simple example of how to create a lambda function triggered by a sns topic.

## Prerequisites

- [ ] [AWS Account](https://aws.amazon.com/)
- [ ] [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html)
- [ ] [AWS CDK](https://docs.aws.amazon.com/cdk/latest/guide/getting_started.html)
- [ ] [Node.js](https://nodejs.org/en/download/)
- [ ] [NPM](https://www.npmjs.com/get-npm)
- [ ] [Git](https://git-scm.com/downloads)

## Installation

```sh
git clone
cd aws-lambda-triggered-by-sns
npm install
```

## Bootstrap

```sh
cdk bootstrap aws://837984857695/us-east-1
```

## To update all the packages to the same version

```sh
npx npm-check-updates -u
```

and then run

```sh
npm install
```

This will solve the error of

```sh
npm ERR! Could not resolve dependency:
npm ERR! peer @aws-cdk/core@">=1.0.0 <2.0.0" from @
```

## Multiple Environments

[https://docs.aws.amazon.com/cdk/v2/guide/environments.html](https://docs.aws.amazon.com/cdk/v2/guide/environments.html)

## TO Synth a particular stack we can just pass that as props

```sh
cdk synth stackid1
cdk deploy stackid2
```

## Its' good to have Eslint Set up

## GEnerate diagram for your project

First install the dependency

```sh
npm install ckd-dia
```

Then install Graphviz for Mac

```sh
brew install graphviz
```

First synth the project then run the following command

```sh

npx cdk-dia
```

or for an interactive html

```sh

npx cdk-dia --rendering cytoscape-html
```

## To deploy the stack

```sh
cdk deploy
```

## To destroy the stack

```sh
cdk destroy
```

## To run the tests

```sh
npm run test
```

## To run the linter

```sh

npm run lint
```

## To run the linter and fix the errors

```sh
npm run lint:fix
```

# Create a Nodejs lambda function that will get triggered by an sns notification

```js
import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as sns from '@aws-cdk/aws-sns';
import * as subs from '@aws-cdk/aws-sns-subscriptions';
import * as iam from '@aws-cdk/aws-iam';

export class AwsLambdaTriggeredBySnsStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const topic = new sns.Topic(this, 'MyTopic', {
      displayName: 'MyTopic',
    });

    const lambdaFunction = new lambda.Function(this, 'MyLambdaFunction', {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromA sset('lambda'),
      handler: 'index.handler',
      environment: {
        TOPIC_ARN: topic.topicArn,
      },
    });

    const lambdaRole = lambdaFunction.role as iam.Role;

    lambdaRole.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['sns:Publish'],
        resources: [topic.topicArn],
      })
    );

    topic.addSubscription(
      new subs.LambdaSubscription(lambdaFunction, {
        filterPolicy: {
          test: sns.SubscriptionFilter.stringFilter({
            whitelist: ['test'],
          }),
        },
      })
    );
  }
}
```

Let's see what's happening here

```js
const topic = new sns.Topic(this, "MyTopic", {
  displayName: "MyTopic",
});
```

We are creating a new sns topic with the name MyTopic

```js
const lambdaFunction = new lambda.Function(this, "MyLambdaFunction", {
  runtime: lambda.Runtime.NODEJS_12_X,
  code: lambda.Code.fromAsset("lambda"),
  handler: "index.handler",
  environment: {
    TOPIC_ARN: topic.topicArn,
  },
});
```

We are creating a new lambda function with the name MyLambdaFunction

```js

const lambdaRole = lambdaFunction.role as iam.Role;

lambdaRole.addToPolicy(
  new iam.PolicyStatement({
    effect: iam.Effect.ALLOW,
    actions: ['sns:Publish'],
    resources: [topic.topicArn],
  })
);
```

We are adding a policy to the lambda function to allow it to publish to the sns topic

```js
topic.addSubscription(
  new subs.LambdaSubscription(lambdaFunction, {
    filterPolicy: {
      test: sns.SubscriptionFilter.stringFilter({
        whitelist: ["test"],
      }),
    },
  })
);
```

We are adding a subscription to the sns topic to trigger the lambda function

## Create a lambda function

```js
"use strict";

exports.handler = async (event) => {
  console.log("event", event);
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: "Go Serverless v1.0! Your function executed successfully!",
        input: event,
      },
      null,
      2
    ),
  };
};
```
