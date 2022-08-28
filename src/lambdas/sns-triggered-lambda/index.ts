import { APIGatewayProxyResultV2, SNSEvent } from "aws-lambda";

export async function main(event: SNSEvent): Promise<APIGatewayProxyResultV2> {
  const records = event.Records.map((record) => {
    const { Message, Subject, Type } = record.Sns;

    return { subject: Subject, message: Message, type: Type };
  });

  console.log("records:", JSON.stringify(records, null, 2));

  return {
    body: JSON.stringify({ records }),
    statusCode: 2000,
  };
}
