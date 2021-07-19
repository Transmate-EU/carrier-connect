/* eslint-disable quotes */
/* eslint-disable mocha/no-mocha-arrows */
/* eslint-disable global-require */
import { expect } from "chai";
import { shipmentTesting } from "../../data/data";
import {
  envFile,
  returnShipmentMutation,
  returnCreateManifestMutation,
  returnGetManifestQuery
} from "../data/test.data";

const debug = require("debug")("test:gql");

let api;

console.log("test api");
if (process.env.WEBPACK_TEST) {
  api = require("../../dist/graphql-local");
  console.log("webpack test", "api", api);
} else {
  api = require("../../functions/graphql");
  console.log("normal test", "api", api);
}

describe("Testing serverless graphql", () => {
  let labelIdToCancelPostmen;
  let postmenManifestId;
  describe("should test manifest fetching and creation postmen", () => {
    it("should create label when given shipment [Postmen USPS*USA -> HKG]", async () => {
      const query = returnShipmentMutation("postmen", {
        ...shipmentTesting,
        shipment: {
          ...shipmentTesting.shipment,
          shipTo: {
            ...shipmentTesting.shipment.shipFrom,
            street1: "5/F Hull Lane",
            phone: "18682306030",
            city: "Sham Shui Po",
            postalCode: "999077",
            countryCode: "HK"
          },
          shipFrom: {
            ...shipmentTesting.shipment.shipTo,
            street1: "5160 Wiley Post Way",
            city: "Salt Lake City",
            postalCode: "10001",
            countryCode: "US",
            email: "usps_discounted@test.com",
            phone: "8095545803",
            state: "UT"
          }
        },
        getLabel: false,
        serviceType: "usps-discounted_express_mail_international"
      });
      const result = await api.gqlResolve({
        query,
        context: {
          ...envFile,
          SHIPPER_ACCOUNT_ID: "3ba41ff5-59a7-4ff0-8333-64a4375c7f21",
          SANDBOX: true
        }
      });

      debug("debug %o", result);
      labelIdToCancelPostmen = result.data.createLabel.id;
      expect(result.data.createLabel).to.have.property("id");
      expect(result.data.createLabel).to.have.property("labelUrl");
      expect(result.data.createLabel).to.have.property("trackingNumbers");
      expect(result.data.createLabel).to.have.property("status");
      expect(result.data.createLabel.status).to.be.equal("created");
    });
    it("should create manifest provided right label ids and shipper account id", async () => {
      const query = returnCreateManifestMutation("postmen", {
        labelIds: [labelIdToCancelPostmen],
        shipperManifestAccountId: "3ba41ff5-59a7-4ff0-8333-64a4375c7f21"
      });
      const result = await api.gqlResolve({
        query,
        context: {
          ...envFile,
          SANDBOX: true
        }
      });
      debug("debug %o", result);
      postmenManifestId = result.data.createManifest.id;
      expect(result.data.createManifest).to.have.property("id");
      expect(result.data.createManifest).to.have.property("status");
      expect(result.data.createManifest).to.have.property("createdAt");
      expect(result.data.createManifest).to.have.property("updatedAt");
      expect(result.data.createManifest.status).to.be.equal("manifesting");
    });
    it("should get manifest provided right manifest id", async () => {
      const query = returnGetManifestQuery("postmen", postmenManifestId);
      const result = await api.gqlResolve({
        query,
        context: {
          ...envFile,
          SANDBOX: true
        }
      });
      debug("debug %o", result);
      expect(result.data.manifest).to.have.property("id");
      expect(result.data.manifest).to.have.property("status");
      expect(result.data.manifest).to.have.property("createdAt");
      expect(result.data.manifest).to.have.property("updatedAt");
    });
  });
});
