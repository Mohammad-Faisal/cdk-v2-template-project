import { App } from "aws-cdk-lib";
import { getSecret } from "../utils/get-secret";
import { getSsmParameters } from "../utils/get-ssm-parameter";

export const loadBuildConfig = async (app: App, envName: string) => {
  // FIRST: Read from context file
  const buildConfig = app.node.tryGetContext(envName);

  // SECOND: Read ssm parameter
  const ssmParameters = await getSsmParameters("ap-east-1", ["sharedVpcId"]);

  // THIRD: Read secret
  const secretValue = await getSecret("secret-arn");
  return buildConfig;
};
