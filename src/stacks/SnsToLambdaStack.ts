import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as sns from "aws-cdk-lib/aws-sns";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as subs from "aws-cdk-lib/aws-sns-subscriptions";
import { SnsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";

import * as path from "path";
export class SnsToLambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const topic = new sns.Topic(this, "example-topic");

    const snsLambda = new NodejsFunction(this, "sns-triggered-lambda", {
      memorySize: 1024,
      timeout: cdk.Duration.seconds(5),
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: "main",
      entry: path.join(__dirname, `/../src/sns-triggered-lambda/index.ts`),
    });

    topic.addSubscription(new subs.LambdaSubscription(snsLambda));

    //or
    snsLambda.addEventSource(new SnsEventSource(topic));
  }
}
