# Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `cdk deploy` deploy this stack to your default AWS account/region
- `cdk diff` compare deployed stack with current state
- `cdk synth` emits the synthesized CloudFormation template

### To Bootstrap

```sh
cdk bootstrap aws://837984857695/us-east-1
```

### To update all the packages to the same version

```sh
npx npm-check-updates -u
```

and then run

```sh
npm install
```

This will solve the error of

### Multiple Environments

https://docs.aws.amazon.com/cdk/v2/guide/environments.html

### TO Synth a particular stack we can just pass that as props

```sh
cdk synth stackid1
cdk deploy stackid2
```

### Its' good to have Eslint Set up

### GEnerate diagram for your project

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

### Handling invalid values

```js
const vpcId = process.env.VPC_ID;
if (!vpcId || !isValidVpcId(vpcId)) {
  throw new Error("Please provide a valid VPC_ID environment variable");
}
```

### We can load the configuration from a remote server

```js
axios.get("https://someconfig.mycompany.com/dev").then((devConfig) => {
  const app = new App();
  const stack = new DbStack(app, "DevDb", results);
  app.synth();
});
```

But if the results are not given properly we can face trouble.

So what we can do is we can create a config loader file named `refreshConfig.js`

```js
axios.get("https://someconfig.mycompany.com/dev").then((devConfig) => {
  fs.readFileSync("./env/dev.json", devConfig);
});
```

ANd create an npm script for that.

```json
{
  "scripts": {
    "refresh:config": "node refreshConfig.js"
  }
}
```

### Multiple environments

We can use the `cdk.json` file to change the context values to provide values for different environments

### Hotswapping

If only the code of the lambda changes we don't want don't need to re-deploy the whole thing.
In these cases we can just update the function without changing any cloudformation

```sh
cdk synth --hotswap
```

### Invoking lambda function locally

```js
sam-beta-cdk local invoke CDKStackName/FunctionID -e events/mock.json -n envlocal.json
```

### Running the local api gateway using aws sam

```sh
sam-beta-cdk local start-api -n env-local --warm-containers EAGER
```

### Resolving cdk synth error

cdk automatically want's docker to run the synthesis. If you don't have docker installed on your machine you will get an error.

The solution is either you install docker and start it or you can just install `esbuild`

```
npm install esbuild
```

because it's the default thing. It will resolve your error on the pipeline

### CDK Topics

- Lambda triggered by sns
- Lambda pushing to sns
- Lambda triggered by sqs
- Lambda pushing to sqs
- SNS pushing to sqs
- Lambda responding to Api gateway
- Lambda responding to s3 upload
- How to share resources between stacks
- How to share resources between regions
- How to setup VPC
- How to setup VPC peering
- Hpw to create pipeline for lambda
- How to add security authorizer for lambda
- How to create RDS with cdk
- How to upload values to SSM parameter
- How to use multiple environments
- How to load environment variables dynamically
- How to create a layer and use it across multiple lambda
