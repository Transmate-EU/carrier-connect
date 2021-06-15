/* eslint-disable global-require */
/* eslint-disable mocha/no-mocha-arrows */

import { expect } from "chai";
import { envFile } from "../data/test.data";
import { shipmentTesting } from "../../data/data";

const debug = require("debug")("test:rest:dhl");

let api;

console.log("test api rest");
if (process.env.WEBPACK_TEST) {
  api = require("../../dist/rest-local.js");
  console.log("webpack test", "api", api);
} else {
  api = require("../../functions/rest.js");
  console.log("normal test", "api", api);
}

describe.only("Test DHL REST API", () => {
  describe("should test(labels, rates, and trackings)", () => {
    let dhlShipment;
    let dhlTrackingNumber;

    it("should create shipment, get rates and label when given correct addresses", async () => {
      const response = await api.rest({
        ...envFile,
        type: "createshipment",
        request: {
          type: "dhl",
          shipment: {
            ...shipmentTesting,
            getLabel: true,
            serviceType: "dhl",
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
            }
          }
        }
      });

      dhlShipment = response.body.result;
      dhlTrackingNumber = dhlShipment.id;
      expect(dhlShipment).to.have.property("id");
      expect(dhlShipment.id).to.be.a("string");
      expect(dhlShipment).to.have.property("rates");
      expect(dhlShipment).to.have.property("label");
      expect(dhlShipment.rates[0]).to.have.property("totalCharge");
      expect(dhlShipment.rates.length).to.be.greaterThan(0);
      expect(dhlShipment).to.be.property("trackingNumber");
      expect(response.statusCode).to.be.equal(200);
    });

    it("should get tracking", async () => {
      const response = await api.rest({
        ...envFile,
        type: "trackingstatus",
        request: {
          type: "dhl",
          tracking: {
            trackingNumber: dhlTrackingNumber
          }
        }
      });
      debug("tracking %o", response);
      const tracking = response.body.result;
      expect(tracking).to.have.property("shipmentWeight");
      expect(tracking).to.have.property("shipmentWeightUnit");
      expect(tracking).to.have.property("shipmentPackageCount");
      expect(tracking).to.have.property("messageReference");
      expect(tracking.shipmentWeightUnit).to.be.equal("K");
      expect(response.statusCode).to.be.equal(200);
    });
  });
});
