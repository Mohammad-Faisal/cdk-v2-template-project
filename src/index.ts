#!/usr/bin/env node
import "source-map-support/register";
import { App } from "aws-cdk-lib";
import { PipelineStack } from "./stacks/PipelineStack";
import { BuildConfig } from "./config/build-config";
import { loadBuildConfig } from "./config/load-build-config";
import { ServerlessStack } from "./stacks/ServerlessStack";
import { VpcPeeringStack } from "./stacks/VpcPeeringStack";
import { PeeringStack } from "./stacks/PeeringStack";
import { Ec2InstanceStack } from "./stacks/Ec2InstanceStack";
import { LambdaInVpcStack } from "./stacks/LambdaInVpcStack";
import { AllowVPCPeeringDNSResolution } from "./constructs/AllowVpcPeeringDnsResolution";
import { VpcStack } from "./stacks/VpcStack";

const app = new App();

async function main() {
  const stageName = process.env.STAGE_NAME;

  if (!stageName) {
    throw new Error("Please provide the stage name");
  }

  console.log("stage name ", stageName);
  const buildConfig: BuildConfig = await loadBuildConfig(app, stageName);

  console.log("build config is  ", buildConfig);

  // const sharedVpc = new VpcStack(app, "Shared-Vpc", {
  //   cidrRange: "10.0.0.0/16",
  //   env: {
  //     region: "us-west-1",
  //     account: "837984857695",
  //   },
  // });

  // new VpcPeeringStack(app, "Vpc-Peering", {
  //   env: {
  //     region: "us-east-1",
  //     account: "837984857695",
  //   },
  // });

  //   const redVpc = new VpcStack(app, "Shared-VpcStack", {
  //     vpcName: "Shared",
  //     cidr: "10.0.0.0/16", // <--- two non-overlapping CIDR ranges for our two VPCs
  //     maxAzs: 1, // <--- to keep the costs down, we'll stick to 1 availability zone per VPC (obviously, not something you'd want to do in production)
  //   });

  //   const blueVpc = new VpcStack(app, "Dedicated-VpcStack", {
  //     vpcName: "Dedicated-Blue",
  //     cidr: "10.1.0.0/16",
  //     maxAzs: 1, // <--- to keep the costs down, we'll stick to 1 availability zone per VPC (obviously, not something you'd want to do in production)
  //   });

  // TODO: Ideally there will be only one stack and the names will be defined by the stage

  //   new Ec2InstanceStack(app, "InstancePeersStack", {
  //     vpcs: [blueVpc.createdVpc, redVpc.createdVpc],
  //   });

  // I want to reach Red from Blue
  //   const peeringConnection = new PeeringStack(app, "Blue-Red-Peering", {
  //     vpcs: [blueVpc.createdVpc, redVpc.createdVpc],
  //   });

  //   new AllowVPCPeeringDNSResolution(app, "Blue-Red-Peering-DNS-Resolution", {
  //     vpcPeering: peeringConnection.peeringConnection,
  //   });

  //   new LambdaInVpcStack(app, "LambdaInVpcStack", {
  //     vpc: blueVpc.createdVpc,
  //   });

  new ServerlessStack(app, `${stageName}-ServerlessStack`, {
    stageName,
    env: {
      region: "us-west-1",
      account: "837984857695",
    },
  });

  //   new PipelineStack(app, `${stageName}-PipelineStack`, {
  //     env: {
  //       account: buildConfig.AWS_ACCOUNT_ID,
  //       region: buildConfig.AWS_PROFILE_REGION,
  //     },
  //   });

  app.synth();
}

main();
