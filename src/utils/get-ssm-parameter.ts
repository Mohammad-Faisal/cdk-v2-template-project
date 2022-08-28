import * as AWS from "aws-sdk";

export const getSsmParameters = async (
  region: string,
  parameterNames: string[]
) => {
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
