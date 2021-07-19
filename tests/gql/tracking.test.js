/* eslint-disable prefer-destructuring */
/* eslint-disable quotes */
/* eslint-disable mocha/no-mocha-arrows */
/* eslint-disable global-require */
import { expect } from "chai";
import { shipmentTesting } from "../../data/data";
import {
  envFile,
  returnShipmentMutation,
  returnGetTrackingQuery
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
  let dhlTrackingNumber;

  describe("should test label fetching and creation dhl", () => {
    it("should create label when given shipment [DHL *AT -> US]", async () => {
      const query = returnShipmentMutation("dhl", {
        ...shipmentTesting,
        shipment: {
          ...shipmentTesting.shipment,
          shipFrom: {
            ...shipmentTesting.shipment.shipFrom,
            street1: "215 Clayton St.",
            city: "Prague",
            postalCode: "1100",
            countryCode: "AT"
          },
          shipTo: {
            ...shipmentTesting.shipment.shipTo,
            street1: "Oak street",
            city: "San Francisco",
            postalCode: "10007",
            countryCode: "US"
          }
        },
        getLabel: false,
        serviceType: "P"
      });
      const result = await api.gqlResolve({
        query,
        context: {
          ...envFile,
          SANDBOX: true
        }
      });
      debug("label %o", result.data.createLabel);
      const label = result.data.createLabel;
      dhlTrackingNumber = label.trackingNumbers[0];
      expect(label).to.have.property("id");
      expect(label).to.have.property("labelUrl");
      expect(label).to.have.property("trackingNumbers");
      expect(label).to.have.property("status");
      expect(label.status).to.be.equal("created");
    });

    it("should get tracking when provided tracking number", async () => {
      const query = returnGetTrackingQuery("dhl", {
        trackingNumber: dhlTrackingNumber,
        trackingSlug: "dhl"
      });
      const response = await api.gqlResolve({
        query,
        context: {
          ...envFile,
          SANDBOX: true
        }
      });
      const tracking = response.data.trackingStatus;
      expect(tracking).to.have.property("shipmentWeight");
      expect(tracking).to.have.property("shipmentWeightUnit");
      expect(tracking).to.have.property("shipmentPackageCount");
      expect(tracking).to.have.property("messageReference");
      expect(tracking.shipmentWeightUnit).to.be.equal("K");
    });

    it("should not get tracking when provided wrong tracking number", async () => {
      const query = returnGetTrackingQuery("dhl", {
        trackingNumber: "dhlTrackingNumber",
        trackingSlug: "dhl"
      });
      const response = await api.gqlResolve({
        query,
        context: {
          ...envFile,
          SANDBOX: true
        }
      });
      const errors = JSON.parse(response.errors[0].message);
      expect(errors[0]).to.property("info");
      expect(errors[0].info).to.be.equal(
        "no tracking details for DHL AWB dhlTrackingNumber"
      );
    });
  });
});
