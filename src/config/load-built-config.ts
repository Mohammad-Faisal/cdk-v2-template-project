import { App } from "aws-cdk-lib";
import { getSecret } from "../utils/get-secret";
import * as AWS from "aws-sdk";

export const loadBuildConfig = async (app: App, stageName: string) => {
  const buildConfig = app.node.tryGetContext(stageName);

  buildConfig.STAGE_NAME = stageName;

  // const ssmParameters = await getSsmParameters("ap-southeast-1", [
  //   "sample-key",
  // ]);

  return buildConfig;
};

const getSsmParameters = async (region: string, parameterNames: string[]) => {
  const ssmClient = new AWS.SSM({ region });

  let data;
  try {
    data = await ssmClient
      .getParameters({
        Names: parameterNames,
      })
      .promise();

    console.log("data is ", data);
  } catch (err) {
    throw Error("Required parameters not found");
  }

  return data?.Parameters;
};
