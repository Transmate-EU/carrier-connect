/* eslint-disable global-require */
/* eslint-disable mocha/no-mocha-arrows */
import chai from "chai";
import { envFile } from "../data/test.data";
import { shipmentAddress, shipmentTesting } from "../../data/data";

const debug = require("debug")("test:rest");

let api;

console.log("test api rest");
if (process.env.WEBPACK_TEST) {
  api = require("../../dist/rest-local");
  console.log("webpack test", "api", api);
} else {
  api = require("../../functions/rest");
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
          address: shipmentAddress
        }
      });
      expect(response.body.result).to.have.property("id");
      expect(response.body.result).to.have.property("isComplete");
      expect(response.body.result.validationResults.isValid).to.be.equal(true);
    });

    it("should create and get shipment, rates and label", async () => {
      const response = await api.rest({
        ...envFile,
        SHIPPER_ACCOUNT_ID: envFile.SHIPPO_TEST_SHIPPER_ACCOUNT,
        type: "createshipment",
        request: {
          type: "shippo",
          shipment: {
            ...shipmentTesting,
            shipment: {
              shipFrom: shipmentAddress,
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
              parcels: shipmentTesting.shipment.parcels
            },
            serviceType: "usps_priority_express",
            getLabel: true
          }
        }
      });
      debug("create shipment return %o", response);
      shippoShipment = response.body.result;
      shippoLabel = response.body.result.label;
      expect(shippoShipment).to.have.property("id");
      expect(shippoShipment).to.have.property("rates");
      expect(response.statusCode).to.be.equal(200);
    });

    it("should create label when provided a shipment", async () => {
      const response = await api.rest({
        ...envFile,
        SHIPPER_ACCOUNT_ID: envFile.SHIPPO_TEST_SHIPPER_ACCOUNT,
        type: "createlabel",
        request: {
          type: "shippo",
          shipment: {
            ...shipmentTesting,
            shipment: {
              shipFrom: shipmentAddress,
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
              parcels: shipmentTesting.shipment.parcels
            },
            serviceType: "usps_priority_express",
            getLabel: false
          }
        }
      });
      debug("create label return %o", response);
      shippoLabel = response.body.result;
      expect(response.body.result).to.have.property("id");
      expect(response.body.result).to.have.property("status");
      expect(response.body.result.status).to.be.equal("created");
      expect(response.statusCode).to.be.equal(200);
    });

    it("should not create label when provided a wrong service type", async () => {
      const response = await api.rest({
        ...envFile,
        SHIPPER_ACCOUNT_ID: envFile.SHIPPO_TEST_SHIPPER_ACCOUNT,
        type: "createlabel",
        request: {
          type: "shippo",
          shipment: {
            ...shipmentTesting,
            shipment: {
              shipFrom: shipmentAddress,
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
              parcels: shipmentTesting.shipment.parcels
            },
            serviceType: "usps_priorty_express",
            getLabel: false
          }
        }
      });
      debug("create label return %o", response);
      const error = JSON.parse(response.body.error.message);
      expect(error[0]).to.have.property("info");
      expect(error[0].info).to.be.equal(
        "Servicelevel usps_priorty_express not found. See https://api.goshippo.com/docs for supported servicelevels."
      );
    });

    it("should get rates when provided a shipment", async () => {
      const response = await api.rest({
        ...envFile,
        SHIPPER_ACCOUNT_ID: envFile.SHIPPO_TEST_SHIPPER_ACCOUNT,
        type: "rates",
        request: {
          type: "shippo",
          shipment: {
            ...shipmentTesting,
            shipment: {
              shipFrom: shipmentAddress,
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
              parcels: shipmentTesting.shipment.parcels
            },
            serviceType: "usps_priority_express",
            getLabel: false
          }
        }
      });
      debug("create rates return %o", response);
      expect(response.body.result[0]).to.have.property("id");
      expect(response.body.result[0]).to.have.property("status");
      expect(response.body.result[0].status).to.be.equal("calculated");
      expect(response.statusCode).to.be.equal(200);
    });

    it("should not refund/cancel label that does not exist", async () => {
      const response = await api.rest({
        ...envFile,
        type: "cancelOrDeleteLabel",
        request: {
          type: "shippo",
          labelId: "shippoLabel.id"
        }
      });
      const error = JSON.parse(response.body.error.message);
      expect(error[0]).to.have.property("info");
      expect(error[0].info).to.be.equal(
        "Transaction with supplied object_id not found."
      );
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
      expect(response.body.result.status).to.be.equal("cancelled");
    });
  });
});
