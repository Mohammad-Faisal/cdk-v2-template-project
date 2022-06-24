import { App } from "aws-cdk-lib";
import { getSecret } from "../utils/get-secret";

export const loadBuildConfig = async (app: App, stageName: string) => {
  const buildConfig = app.node.tryGetContext(stageName);

  buildConfig.STAGE_NAME = stageName;

  return buildConfig;
};
