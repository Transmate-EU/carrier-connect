/* eslint-disable global-require */
/* eslint-disable mocha/no-mocha-arrows */
import { expect } from "chai";

const debug = require("debug")("test:rest");

let api;

if (process.env.WEBPACK_TEST) {
  api = require("../dist/index-local.js");
  debug("webpack test index", "api", api);

  describe("should export keys", () => {
    it("check index-local", async () => {
      expect(api).to.have.property("rest");
      expect(api).to.have.property("shippoShipmentTesting");
      expect(api.shippoShipmentTesting).to.have.property("shipTo");
      expect(api.rest).to.not.eql(undefined);
    });
  });
}
