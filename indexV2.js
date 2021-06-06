/* eslint-disable global-require */
import { createLabel } from "./data/data";
import { envFile } from "./tests/data/test.data";

let api;

console.log("test api rest");
if (process.env.WEBPACK_TEST) {
  api = require("./dist/rest-local.js");
  console.log("webpack test", "api", api);
} else {
  api = require("./functions/rest.js");
  console.log("normal test", "api", api);
}

const testFunction = async () => {
  try {
    // const data = await new Call("dhl").getRates(ratesObject);
    const response = await api.rest({
      ...envFile,
      type: "shipment",
      request: {
        type: "postmen",
        shipment: createLabel
      }
    });

    console.log("data", response);
  } catch (error) {
    console.log("error", error);
  }
};

testFunction();
