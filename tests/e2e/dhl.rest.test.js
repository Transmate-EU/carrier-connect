/* eslint-disable global-require */
/* eslint-disable mocha/no-mocha-arrows */

import { expect } from "chai";
import { envFile } from "../data/test.data";
import { shipmentTesting } from "../../data/data";

const debug = require("debug")("test:rest:dhl");

let api;

console.log("test api rest");
if (process.env.WEBPACK_TEST) {
  api = require("../../dist/rest-local");
  console.log("webpack test", "api", api);
} else {
  api = require("../../functions/rest");
  console.log("normal test", "api", api);
}

describe("Test DHL REST API", () => {
  describe("should test(labels, rates, and trackings)", () => {
    let dhlShipment;
    let dhlTrackingNumber;

    it.skip("should create shipment, get rates and label when given correct addresses", async () => {
      const response = await api.rest({
        ...envFile,
        type: "createshipment",
        request: {
          type: "dhl",
          shipment: {
            ...shipmentTesting,
            getLabel: false,
            serviceType: "P",
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
      expect(dhlShipment.id).to.be.a("string"); // tracking number
      expect(dhlShipment).to.have.property("rates");
      expect(dhlShipment).to.have.property("label");
      debug("dhl rates %o", dhlShipment.rates);
      expect(dhlShipment.rates[0]).to.have.property("totalCharge");
      expect(dhlShipment.rates.length).to.be.greaterThan(0);
      expect(dhlShipment).to.be.property("trackingNumber");
      expect(response.statusCode).to.be.equal(200);
    });
    it("should get rates", async () => {
      const response = await api.rest({
        ...envFile,
        type: "rates",
        request: {
          type: "dhl",
          shipment: {
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
            }
          }
        }
      });
      debug("rates %o", response.body);
      expect(response.body.result).to.be.an("array");
      debug("service type %o", response.body.result[0].serviceType);
      expect(response.body.result[0].totalCharge).to.have.property("amount");
      expect(response.body.result[0].totalCharge.amount).to.be.a("string");
    });

    it("should get label", async () => {
      const response = await api.rest({
        ...envFile,
        type: "createlabel",
        request: {
          type: "dhl",
          serviceType: "8", // there is always a P option
          label: {
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
            }
          }
        }
      });
      debug("labels %o", response.body);
      expect(response.body.result.shipment.rates).to.be.an("array");
      expect(
        response.body.result.shipment.rates[0].totalCharge
      ).to.have.property("amount");
      expect(response.body.result.shipment.rates[0].totalCharge.amount).to.be.a(
        "string"
      );
      expect(response.body.result.shipment.label).to.be.a("object");
      expect(response.body.result.shipment.trackingNumber).to.be.a("string");
      dhlTrackingNumber = response.body.result.shipment.trackingNumber;
    });

    it.skip("should get tracking", async () => {
      debug("get tracking for %s", dhlTrackingNumber);
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
      expect(tracking).to.be.an("object");
      expect(tracking).to.have.property("shipmentWeight");
      expect(tracking).to.have.property("shipmentWeightUnit");
      expect(tracking).to.have.property("shipmentPackageCount");
      expect(tracking).to.have.property("messageReference");
      expect(tracking.shipmentWeightUnit).to.be.equal("K");
      expect(response.statusCode).to.be.equal(200);
    });
  });
});
