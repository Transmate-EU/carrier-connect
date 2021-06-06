/* eslint-disable global-require */
/* eslint-disable mocha/no-mocha-arrows */
import chai from "chai";
import { envFile } from "../data/test.data";
import { shipmentAddress, shipmentTesting } from "../../data/data";

const debug = require("debug")("test:rest");

let api;

console.log("test api rest");
if (process.env.WEBPACK_TEST) {
  api = require("../../dist/rest-local.js");
  console.log("webpack test", "api", api);
} else {
  api = require("../../functions/rest.js");
  console.log("normal test", "api", api);
}

const { expect } = chai;

describe("Test shippo REST API", () => {
  describe("should test(labels, rates, manifest and shipments)", () => {
    let shippoShipment;
    let shippoLabel;
    let address;

    it("should error, no env", async () => {
      const response = await api.rest({
        type: "createShipment",
        request: {
          type: "shippo",
          shipment: shipmentTesting
        }
      });
      debug("create shipment return %o", response);
      shippoShipment = response.body.result;
      expect(response.statusCode).to.be.equal(400);
      expect(response.body.error.message).to.equal("check keys for shippo!");
    });
    it("should create and get shipment, rates and label", async () => {
      const response = await api.rest({
        ...envFile,
        type: "createshipment",
        request: {
          type: "shippo",
          shipment: { ...shipmentTesting, getLabel: true }
        }
      });
      debug("create shipment return %o", response);
      shippoShipment = response.body.result;
      shippoLabel = response.body.result.label;
      expect(shippoShipment).to.have.property("id");
      expect(shippoShipment).to.have.property("rates");
      expect(response.statusCode).to.be.equal(200);
    });

    it("should create address", async () => {
      const response = await api.rest({
        ...envFile,
        type: "createAddress",
        request: {
          type: "shippo",
          address: shipmentAddress
        }
      });
      address = response.body.result;
      expect(address).to.have.property("id");
      expect(address).to.have.property("isComplete");
      expect(response.statusCode).to.be.equal(200);
    });

    it("should validate address", async () => {
      const response = await api.rest({
        ...envFile,
        type: "validateAddress",
        request: {
          type: "shippo",
          address: { id: address.id }
        }
      });
      expect(response.body.result).to.have.property("id");
      expect(response.body.result).to.have.property("isComplete");
      expect(response.body.result.validationResults.isValid).to.be.equal(true);
    });

    it("should refund/cancel label", async () => {
      const response = await api.rest({
        ...envFile,
        type: "cancelOrDeleteLabel",
        request: {
          type: "shippo",
          labelId: shippoLabel.id
        }
      });
      expect(response.body.result).to.have.property("id");
      expect(response.body.result).to.have.property("status");
      expect(response.body.result).to.have.property("transaction");
    });

    it("should get tracking status label", async () => {
      const response = await api.rest({
        ...envFile,
        type: "trackingStatus",
        request: {
          type: "shippo",
          tracking: {
            trackingNumber: "SHIPPO_DELIVERED",
            trackingSlug: "shippo"
          }
        }
      });
      expect(response.body.result).to.have.property("deliveryType");
      expect(response.body.result).to.have.property("serviceToken");
      expect(response.body.result).to.have.property("serviceType");
    });
  });
});
