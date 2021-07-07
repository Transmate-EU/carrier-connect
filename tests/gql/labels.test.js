/* eslint-disable quotes */
/* eslint-disable mocha/no-mocha-arrows */
/* eslint-disable global-require */
import { expect } from "chai";
import { shipmentTesting } from "../../data/data";
import { envFile, returnShipmentMutationString } from "../data/test.data";

const debug = require("debug")("test:gql");

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
  describe("should test label fetching and creation postmen", () => {
    it("should create label when given shipment [Postmen USPS*USA -> HKG]", async () => {
      const query = returnShipmentMutationString("postmen", {
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
      expect(result.data.createLabel).to.have.property("id");
      expect(result.data.createLabel).to.have.property("labelUrl");
      expect(result.data.createLabel).to.have.property("trackingNumbers");
      expect(result.data.createLabel).to.have.property("status");
      expect(result.data.createLabel.status).to.be.equal("created");
    });
    it("should not create label when given wrong service type for postmen", async () => {
      const query = returnShipmentMutationString("postmen", {
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
        serviceType: "usp-discounted_express_mail_international"
      });
      const result = await api.gqlResolve({
        query,
        context: {
          ...envFile,
          SHIPPER_ACCOUNT_ID: "3ba41ff5-59a7-4ff0-8333-64a4375c7f21",
          SANDBOX: true
        }
      });
      const errors = JSON.parse(result.errors[0].message);
      expect(errors[0]).to.property("info");
      expect(errors[0].info).to.be.equal(
        'data.service_type should be equal to one of values ["usps-discounted_express_mail","usps-discounted_express_mail_international","usps-discounted_first_class_package","usps-discounted_first_class_package_international","usps-discounted_library_mail","usps-discounted_media_mail","usps-discounted_parcel_select_ground","usps-discounted_priority_mail","usps-discounted_priority_mail_international"]'
      );
    });
  });
  describe("should test label fetching and creation shippo", () => {
    it("should create label when given shipment [Shippo USPS*USA -> USA]", async () => {
      const query = returnShipmentMutationString("shippo", {
        ...shipmentTesting,
        shipment: {
          ...shipmentTesting.shipment,
          shipTo: {
            ...shipmentTesting.shipment.shipFrom,
            street1: "965 Mission St #572",
            phone: "4151234567",
            city: "San Francisco",
            postalCode: "94103",
            countryCode: "US"
          },
          shipFrom: {
            ...shipmentTesting.shipment.shipTo,
            street1: "5160 Wiley Post Way",
            city: "Salt Lake City",
            postalCode: "10001",
            countryCode: "US",
            email: "usps_discounted@test.com",
            phone: "8095545803",
            state: "CA"
          }
        },
        getLabel: false,
        serviceType: "usps_priority_express"
      });
      const result = await api.gqlResolve({
        query,
        context: {
          ...envFile,
          SHIPPER_ACCOUNT_ID: envFile.SHIPPO_TEST_SHIPPER_ACCOUNT,
          SANDBOX: true
        }
      });
      expect(result.data.createLabel).to.have.property("id");
      expect(result.data.createLabel).to.have.property("labelUrl");
      expect(result.data.createLabel).to.have.property("trackingNumbers");
      expect(result.data.createLabel).to.have.property("status");
      expect(result.data.createLabel.status).to.be.equal("created");
    });
  });
});
