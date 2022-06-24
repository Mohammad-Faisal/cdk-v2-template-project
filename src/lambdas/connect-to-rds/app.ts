import * as AWS from "aws-sdk";
import fetch from "node-fetch";
import { Client } from "pg";

const client = new Client({
  user: "sgpostgres",
  host: "SG-PostgreNoSSL-14-pgsql-master.devservers.scalegrid.io",
  database: "postgres",
  password: "password",
  port: 5432,
});
client.connect(function (err) {
  if (err) throw err;
  console.log("Connected!");
});
exports.handler = async function (event: any, context: any) {
  console.log("request ", JSON.stringify(event));
  let resJson: any = "No response yet";
  try {
    const res = await fetch("https://randomuser.me/api");
    resJson = await res.json();

    return {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Allow-Methods": "*",
        "Access-Control-Allow-Headers":
          "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, Authorization",
      },

      isBase64Encoded: false,
      multiValueHeaders: {},
      statusCode: 200,
      body: resJson,
    };
  } catch (err) {
    console.log("Error occurred", err);
  }
};
