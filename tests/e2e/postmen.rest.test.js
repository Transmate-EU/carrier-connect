/* eslint-disable global-require */
/* eslint-disable mocha/no-mocha-arrows */

import { expect } from "chai";
import { shipmentAddress, shipmentTesting } from "../../data/data";
import { envFile } from "../data/test.data";

const debug = require("debug")("test:postment:rest");

let api;

console.log("test api rest");
if (process.env.WEBPACK_TEST) {
  api = require("../../dist/rest-local.js");
  console.log("webpack test", "api", api);
} else {
  api = require("../../functions/rest.js");
  console.log("normal test", "api", api);
}

describe("Test postmen REST API", () => {
  describe("should test(labels, rates, manifest and shipments)", () => {
    let postmenLabel;
    let postmenLabels;
    let postmenManifest;

    it("should create shipment, calculate rates and get a label given a shipment", async () => {
      const response = await api.rest({
        ...envFile,
        type: "createshipment",
        request: {
          type: "postmen",
          shipment: {
            ...shipmentTesting,
            shipment: {
              ...shipmentTesting.shipment,
              shipFrom: {
                ...shipmentTesting.shipment.shipFrom,
                street1: "5/F Hull Lane",
                city: "Sham Shui Po",
                postalCode: null,
                countryCode: "HK"
              },
              shipTo: {
                ...shipmentTesting.shipment.shipTo,
                street1: "28292 Daugherty Orchard",
                city: "Sacramento",
                postalCode: "94209",
                countryCode: "US",
                state: "CA"
              }
            },
            getLabel: true,
            serviceType: "fedex_international_priority"
          }
        }
      });
      debug("rates %o", response);
      postmenLabel = response.body.result.label;
      expect(response.body.result).to.have.property("label");
      expect(response.body.result).to.have.property("rates");
      expect(response.body.result.label).to.have.property("id");
      expect(response.body.result.rates[0]).to.have.property("totalCharge");
      expect(response.statusCode).to.be.equal(200);
    });

    it("should get labels", async () => {
      const response = await api.rest({
        ...envFile,
        type: "labels",
        request: {
          type: "postmen"
        }
      });
      postmenLabels = response.body.result;
      debug("postmenLabels %o", postmenLabels);
      expect(postmenLabels[0]).to.have.property("id");
      expect(postmenLabels[0]).to.have.property("status");
      expect(postmenLabels[0]).to.have.property("rate");
      expect(postmenLabels[0].rate).to.have.property("totalCharge");
      expect(response.statusCode).to.be.equal(200);
    });

    it("should validate address", async () => {
      const response = await api.rest({
        ...envFile,
        type: "validateaddress",
        request: {
          type: "postmen",
          address: shipmentAddress
        }
      });
      expect(response.body.result).to.have.property("id");
      expect(response.body.result).to.have.property("status");
      expect(response.body.result.status).to.have.be.equal("valid");
      expect(response.body.result).to.have.property("createdAt");
      expect(response.body.result).to.have.property("updatedAt");
    });

    it("should cancel label", async () => {
      const response = await api.rest({
        ...envFile,
        type: "cancelordeleteLabel",
        request: {
          type: "postmen",
          labelId: postmenLabel.id
        }
      });
      expect(response.body.result).to.have.property("id");
      expect(response.body.result).to.have.property("status");
      expect(response.statusCode).to.be.equal(200);
    });

    it("should create manifest", async () => {
      const response = await api.rest({
        ...envFile,
        type: "createManifest",
        request: {
          type: "postmen"
        }
      });
      postmenManifest = response.body.result;
      expect(postmenManifest).to.have.property("id");
      expect(postmenManifest).to.have.property("status");
      expect(postmenManifest).to.have.property("createdAt");
      expect(response.statusCode).to.be.equal(200);
    });

    it("should get created manifest", async () => {
      const response = await api.rest({
        ...envFile,
        type: "manifest",
        request: {
          type: "postmen",
          manifestId: postmenManifest.id
        }
      });
      expect(response.body.result).to.have.property("id");
      expect(response.body.result).to.have.property("status");
      expect(response.body.result).to.have.property("createdAt");
      expect(response.statusCode).to.be.equal(200);
    });
  });
});
