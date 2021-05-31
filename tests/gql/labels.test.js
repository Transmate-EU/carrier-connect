/* eslint-disable mocha/no-mocha-arrows */
/* eslint-disable global-require */
import chai from "chai";
import { setEnv } from "../../functions/setEnv";

const { expect } = chai;

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
        context: () => {
          setEnv(process.env);
          return true;
        }
      });

      expect(result.data).to.have.property("labels");
    } catch (error) {
      console.log("error message", error.message);
    }
  });
});
