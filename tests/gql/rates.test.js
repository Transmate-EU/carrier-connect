/* eslint-disable quotes */
/* eslint-disable mocha/no-mocha-arrows */
/* eslint-disable global-require */
import { expect } from "chai";
import { shipmentTesting } from "../../data/data";
import { envFile, returnRatesQuery } from "../data/test.data";

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
  describe("should fetch rates for postmen when provided shipment", () => {
    it("should fetch rates for postmen when provided shipment[USPS US -> HK]", async () => {
      const query = returnRatesQuery("postmen", {
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
      debug("rates", result);
      expect(result.data.rates[0]).to.have.property("id");
      expect(result.data.rates[0]).to.have.property("totalCharge");
      expect(result.data.rates[0]).to.have.property("deliveryDate");
      expect(result.data.rates[0].status).to.be.equal("calculated");
    });
  });
  describe("should test label fetching and creation shippo", () => {
    it("should fetch rates for shippo when provided shipment[USPS US -> US]", async () => {
      const query = returnRatesQuery("shippo", {
        ...shipmentTesting,
        shipment: {
          ...shipmentTesting.shipment,
          shipTo: {
            contactName: "Mr Hippo",
            street1: "965 Mission St #572",
            city: "San Francisco",
            state: "CA",
            phone: "4151234567",
            email: "mrhippo@goshippo.com",
            postalCode: "94103",
            companyName: "Sanditon",
            countryCode: "US"
          },
          shipFrom: {
            contactName: "Mrs Hippo",
            street1: "1092 Indian Summer Ct",
            city: "California",
            state: "NC",
            companyName: "Sanditon",
            postalCode: "95122",
            countryCode: "US",
            phone: "4159876543",
            email: "testing@gmail.com"
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
      debug("rates", result);
      expect(result.data.rates[0]).to.have.property("id");
      expect(result.data.rates[0]).to.have.property("totalCharge");
      expect(result.data.rates[0]).to.have.property("deliveryDate");
      expect(result.data.rates[0].status).to.be.equal("calculated");
    });
  });
  describe("should test rates fetching in dhl", () => {
    it("should fetch rates when given shipment [DHL *AT -> US]", async () => {
      const query = returnRatesQuery("dhl", {
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
      debug("rates", result);
      expect(result.data.rates[0]).to.have.property("id");
      expect(result.data.rates[0]).to.have.property("totalCharge");
      expect(result.data.rates[0]).to.have.property("deliveryDate");
      expect(result.data.rates[0].status).to.be.equal("calculated");
    });

    it("should fetch rates when given shipment [DHL *AT -> UG]", async () => {
      const query = returnRatesQuery("dhl", {
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
            street1: "Kampala street",
            city: "Kampala",
            postalCode: "0000",
            countryCode: "UG"
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
      debug("rates", result);
      expect(result.data.rates[0]).to.have.property("id");
      expect(result.data.rates[0]).to.have.property("totalCharge");
      expect(result.data.rates[0]).to.have.property("deliveryDate");
      expect(result.data.rates[0].status).to.be.equal("calculated");
    });
    it("should fetch rates when given shipment [DHL *AT -> IT]", async () => {
      const query = returnRatesQuery("dhl", {
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
            street1: "Broadway 1",
            city: "New York",
            postalCode: "50127",
            countryCode: "IT"
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
      debug("rates", result);
      expect(result.data.rates[0]).to.have.property("id");
      expect(result.data.rates[0]).to.have.property("totalCharge");
      expect(result.data.rates[0]).to.have.property("deliveryDate");
      expect(result.data.rates[0].status).to.be.equal("calculated");
    });
  });
});
