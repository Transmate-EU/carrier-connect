/* eslint-disable mocha/no-mocha-arrows */
/* eslint-disable global-require */
import { expect } from "chai";

const debug = require("debug")("test:gql");

const envFile = require("../../.env.json");


let api;

console.log("test api");
if (process.env.WEBPACK_TEST) {
  api = require("../../dist/graphql-local.js");
  console.log("webpack test", "api", api);
} else {
  api = require("../../functions/graphql.js");
  console.log("normal test", "api", api);
}

describe("Testing serverless graphql", () => {
  it("should return labels", async () => {
    try {
      const result = await api.gqlResolve({
        query: `{
          labels(type:"postmen"){
            id
          }
        }`,
        context: { ...envFile, SANDBOX: true }
      });

      expect(result.data).to.have.property("labels");
      expect(result.data.labels).to.be.an("array");
      debug("labels %o", result.data.labels);
      expect(result.data.labels[0].id).to.be.an("string");

    } catch (error) {
      console.error("error message", error.message);
    }
  });
});
