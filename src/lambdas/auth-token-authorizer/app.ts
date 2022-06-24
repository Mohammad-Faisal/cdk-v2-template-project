import {
  Context,
  APIGatewayTokenAuthorizerEvent,
  APIGatewayAuthorizerCallback,
  APIGatewayAuthorizerResult,
  PolicyDocument,
} from "aws-lambda";
exports.handler = function (
  event: APIGatewayTokenAuthorizerEvent,
  context: Context,
  callback: APIGatewayAuthorizerCallback
) {
  var token = event.authorizationToken;
  console.log("the token is ", token);
  /**
   * We can verify the token here
   */
  switch (token) {
    case "allow":
      callback(null, generatePolicy("user", "Allow", event.methodArn));
      break;
    case "deny":
      callback(null, generatePolicy("user", "Deny", event.methodArn));
      break;
    case "unauthorized":
      callback("Unauthorized"); // Return a 401 Unauthorized response
      break;
    default:
      callback("Error: Invalid token"); // Return a 500 Invalid token response
  }
};

// Help function to generate an IAM policy
var generatePolicy = function (
  principalId: string,
  effect: string,
  resource: string
) {
  var authResponse: APIGatewayAuthorizerResult =
    {} as APIGatewayAuthorizerResult;

  authResponse.principalId = principalId;
  if (effect && resource) {
    var policyDocument: PolicyDocument = {} as any;
    policyDocument.Version = "2012-10-17";
    policyDocument.Statement = [];
    var statementOne: any = {};
    statementOne.Action = "execute-api:Invoke";
    statementOne.Effect = effect;
    statementOne.Resource = resource;
    policyDocument.Statement[0] = statementOne;
    authResponse.policyDocument = policyDocument;
  }

  /**
   * Optional output with custom properties of the String, Number or Boolean type.
   * This response is passed to the lambda downstream
   */
  authResponse.context = {
    stringKey: "stringval",
    numberKey: 123,
    booleanKey: true,
  };
  return authResponse;
};
