/* eslint-disable global-require */
/* eslint-disable mocha/no-mocha-arrows */

import { expect } from "chai";
import { envFile } from "../data/test.data";
import { shipmentTesting } from "../../data/data";

let api;

console.log("test api rest");
if (process.env.WEBPACK_TEST) {
  api = require("../../dist/rest-local.js");
  console.log("webpack test", "api", api);
} else {
  api = require("../../functions/rest.js");
  console.log("normal test", "api", api);
}

describe("Test DHL REST API", () => {
  describe("should test(labels, rates, and trackings)", () => {
    let dhlShipment;
    let dhlTrackingNumber;

    it("should create shipment, get rates and label when given correct addresses AT->IT", async () => {
      const response = await api.rest({
        ...envFile,
        type: "createshipment",
        request: {
          type: "dhl",
          shipment: {
            ...shipmentTesting,
            getLabel: true,
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
      expect(dhlShipment).to.have.property("rates");
      expect(dhlShipment).to.have.property("label");
      expect(dhlShipment.rates[0]).to.have.property("totalCharge");
      expect(dhlShipment.rates.length).to.be.greaterThan(0);
      expect(dhlShipment).to.be.property("trackingNumber");
      expect(response.statusCode).to.be.equal(200);
    });

    it("should create shipment, get rates and label when given correct addresses AT->US", async () => {
      const response = await api.rest({
        ...envFile,
        type: "createshipment",
        request: {
          type: "dhl",
          shipment: {
            ...shipmentTesting,
            getLabel: true,
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
                street1: "Oak street",
                city: "San Francisco",
                postalCode: "10007",
                countryCode: "US"
              }
            }
          }
        }
      });
      expect(response.body.result).to.have.property("id");
      expect(response.body.result).to.have.property("rates");
      expect(response.body.result).to.have.property("label");
      expect(response.body.result.rates[0]).to.have.property("totalCharge");
      expect(response.body.result.rates.length).to.be.greaterThan(0);
      expect(response.body.result).to.be.property("trackingNumber");
      expect(response.statusCode).to.be.equal(200);
    });

    it("should create shipment, get rates and label when given correct addresses AT->UG", async () => {
      const response = await api.rest({
        ...envFile,
        type: "createshipment",
        request: {
          type: "dhl",
          shipment: {
            ...shipmentTesting,
            getLabel: true,
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
                street1: "Kampala street",
                city: "Kampala",
                postalCode: "0000",
                countryCode: "UG"
              }
            }
          }
        }
      });
      expect(response.body.result).to.have.property("id");
      expect(response.body.result).to.have.property("rates");
      expect(response.body.result).to.have.property("label");
      expect(response.body.result.rates[0]).to.have.property("totalCharge");
      expect(response.body.result.rates.length).to.be.greaterThan(0);
      expect(response.body.result).to.be.property("trackingNumber");
      expect(response.statusCode).to.be.equal(200);
    });

    it("should not create shipment, get rates and label when given wrong service type", async () => {
      const response = await api.rest({
        ...envFile,
        type: "createshipment",
        request: {
          type: "dhl",
          shipment: {
            ...shipmentTesting,
            getLabel: true,
            serviceType: "AB",
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
            }
          }
        }
      });
      const errors = JSON.parse(response.body.error.message);
      expect(errors[0]).to.be.equal(
        "DHL service type can only be one of these K, T, Y, E, P, U, D, N, H, W"
      );
      expect(response.statusCode).to.be.equal(500);
    });

    it("should get rates when provided a shipment AT->UG", async () => {
      const response = await api.rest({
        ...envFile,
        type: "rates",
        request: {
          type: "dhl",
          shipment: {
            ...shipmentTesting,
            getLabel: true,
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
                street1: "Kampala street",
                city: "Kampala",
                postalCode: "0000",
                countryCode: "UG"
              }
            }
          }
        }
      });
      const rates = response.body.result;
      expect(rates[0]).to.have.property("id");
      expect(rates[0]).to.have.property("totalCharge");
      expect(rates[0].status).to.be.equal("calculated");
      expect(response.statusCode).to.be.equal(200);
    });

    it("should create and get back a created label AT -> UG", async () => {
      const response = await api.rest({
        ...envFile,
        type: "createlabel",
        request: {
          type: "dhl",
          shipment: {
            ...shipmentTesting,
            getLabel: true,
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
                street1: "Kampala street",
                city: "Kampala",
                postalCode: "0000",
                countryCode: "UG"
              }
            }
          }
        }
      });
      const label = response.body.result;
      expect(label).to.have.property("labelUrl");
      expect(label).to.have.property("trackingNumbers");
      expect(response.statusCode).to.be.equal(200);
    });

    it("should create and get back a created label AT -> US", async () => {
      const response = await api.rest({
        ...envFile,
        type: "createlabel",
        request: {
          type: "dhl",
          shipment: {
            ...shipmentTesting,
            getLabel: true,
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
                street1: "Oak street",
                city: "San Francisco",
                postalCode: "10007",
                countryCode: "US"
              }
            }
          }
        }
      });
      const label = response.body.result;
      expect(label).to.have.property("labelUrl");
      expect(label).to.have.property("trackingNumbers");
      expect(response.statusCode).to.be.equal(200);
    });

    it("should create and get back a created label AT -> IT", async () => {
      const response = await api.rest({
        ...envFile,
        type: "createlabel",
        request: {
          type: "dhl",
          shipment: {
            ...shipmentTesting,
            getLabel: true,
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
      const label = response.body.result;
      expect(label).to.have.property("labelUrl");
      expect(label).to.have.property("trackingNumbers");
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
