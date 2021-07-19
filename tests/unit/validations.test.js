/* eslint-disable prefer-destructuring */
/* eslint-disable global-require */
/* eslint-disable mocha/no-mocha-arrows */

import { expect } from "chai";
import { shipmentTesting } from "../../data/data";
import { envFile } from "../data/test.data";

const debug = require("debug")("test:postment:rest");

let api;

console.log("test api rest");
if (process.env.WEBPACK_TEST) {
  api = require("../../dist/rest-local");
  console.log("webpack test", "api", api);
} else {
  api = require("../../functions/rest");
  console.log("normal test", "api", api);
}

describe("Test Shipment for Postmen, Shippo and DHL", () => {
  describe("should test shipment for Postmen, Shippo and DHL", () => {
    it("should throw an error when postmen api key is not provided when using the api", async () => {
      const response = await api.rest({
        type: "rates",
        request: {
          type: "postmen",
          shipment: {
            ...shipmentTesting,
            getLabel: false,
            serviceType: "fedex_international_priority"
          }
        }
      });
      debug("rates %o", response);
      const errorMessage = response.body.error.message;
      expect(response.body.error).to.have.property("message");
      expect(errorMessage).to.be.equal("please provide postmen API key!");
      expect(response.statusCode).to.be.equal(400);
    });

    it("should throw an error when shipment is not provided when creating a shipment, lable or getting rates", async () => {
      const response = await api.rest({
        ...envFile,
        type: "rates",
        request: {
          type: "postmen",
          shipment: {
            ...shipmentTesting,
            shipment: null,
            getLabel: false,
            serviceType: "fedex_international_priority"
          }
        }
      });

      debug("rates %o", response);
      const errors = JSON.parse(response.body.error.message);
      const errorBody = errors[0];
      expect(errorBody).to.have.property("info");
      expect(errorBody.info).to.be.equal("shipment is a required property");
      expect(response.statusCode).to.be.equal(500);
    });

    it("should throw an error when shipTo/parcels/shipFrom are not provided when creating a shipment, lable or getting rates", async () => {
      const response = await api.rest({
        ...envFile,
        type: "rates",
        request: {
          type: "postmen",
          shipment: {
            ...shipmentTesting,
            shipment: {},
            getLabel: false,
            serviceType: "fedex_international_priority"
          }
        }
      });

      debug("rates %o", response);
      const errors = JSON.parse(response.body.error.message);
      expect(errors[0]).to.have.property("info");
      expect(errors[1]).to.have.property("info");
      expect(errors[2]).to.have.property("info");
      expect(errors[0].info).to.be.equal(
        "must have required property 'shipTo'"
      );
      expect(errors[1].info).to.be.equal(
        "must have required property 'shipFrom'"
      );
      expect(errors[2].info).to.be.equal(
        "must have required property 'parcels'"
      );
      expect(response.statusCode).to.be.equal(500);
    });

    it("should throw an error when service type is not provided when creating a shipment, lable or getting rates", async () => {
      const response = await api.rest({
        ...envFile,
        type: "rates",
        request: {
          type: "postmen",
          shipment: {
            ...shipmentTesting,
            getLabel: false,
            serviceType: null
          }
        }
      });

      debug("rates %o", response);
      const errors = JSON.parse(response.body.error.message);
      expect(errors[0]).to.have.property("info");
      expect(errors[0].info).to.be.equal("service type is required property");
      expect(response.statusCode).to.be.equal(500);
    });

    it("should throw an error when address is not complete when creating a shipment, lable or getting rates", async () => {
      const response = await api.rest({
        ...envFile,
        type: "rates",
        request: {
          type: "postmen",
          shipment: {
            ...shipmentTesting,
            shipment: {
              ...shipmentTesting.shipment,
              shipTo: {}
            },
            getLabel: false,
            serviceType: "fedex_international_priority"
          }
        }
      });

      debug("rates %o", response);
      const errors = JSON.parse(response.body.error.message);
      expect(errors[0]).to.have.property("info");
      expect(errors[1]).to.have.property("info");
      expect(errors[2]).to.have.property("info");
      expect(errors[3]).to.have.property("info");
      expect(errors[4]).to.have.property("info");
      expect(errors[5]).to.have.property("info");
      expect(errors[6]).to.have.property("info");
      expect(errors[7]).to.have.property("info");
      expect(errors[0].info).to.be.equal(
        "must have required property 'contactName'"
      );
      expect(errors[1].info).to.be.equal(
        "must have required property 'street1'"
      );
      expect(errors[2].info).to.be.equal("must have required property 'city'");
      expect(errors[3].info).to.be.equal("must have required property 'state'");
      expect(errors[4].info).to.be.equal(
        "must have required property 'postalCode'"
      );
      expect(errors[5].info).to.be.equal(
        "must have required property 'countryCode'"
      );
      expect(errors[6].info).to.be.equal("must have required property 'phone'");
      expect(errors[7].info).to.be.equal("must have required property 'email'");
      expect(response.statusCode).to.be.equal(500);
    });

    it("should throw an error when postal code is not valid when creating a shipment, lable or getting rates", async () => {
      const response = await api.rest({
        ...envFile,
        type: "rates",
        request: {
          type: "postmen",
          shipment: {
            ...shipmentTesting,
            shipment: {
              ...shipmentTesting.shipment,
              shipTo: {
                ...shipmentTesting.shipment.shipTo,
                postalCode: "894"
              }
            },
            getLabel: false,
            serviceType: "fedex_international_priority"
          }
        }
      });

      debug("rates %o", response);
      const errors = JSON.parse(response.body.error.message);
      expect(errors[0]).to.have.property("info");
      expect(errors[0].info).to.be.equal(
        "Must provide a valid postal code and it should not be less than 4 characters"
      );
      expect(response.statusCode).to.be.equal(500);
    });

    it("should throw an error when invalid email is provided when creating a shipment, lable or getting rates", async () => {
      const response = await api.rest({
        ...envFile,
        type: "rates",
        request: {
          type: "postmen",
          shipment: {
            ...shipmentTesting,
            shipment: {
              ...shipmentTesting.shipment,
              shipTo: {
                ...shipmentTesting.shipment.shipTo,
                email: "894.com"
              }
            },
            getLabel: false,
            serviceType: "fedex_international_priority"
          }
        }
      });

      debug("rates %o", response);
      const errors = JSON.parse(response.body.error.message);
      expect(errors[0]).to.have.property("info");
      expect(errors[0].info).to.be.equal("Must provide a valid email address");
      expect(response.statusCode).to.be.equal(500);
    });

    it("should throw an error when invalid city name is provided when creating a shipment, lable or getting rates", async () => {
      const response = await api.rest({
        ...envFile,
        type: "rates",
        request: {
          type: "postmen",
          shipment: {
            ...shipmentTesting,
            shipment: {
              ...shipmentTesting.shipment,
              shipTo: {
                ...shipmentTesting.shipment.shipTo,
                city: "b"
              }
            },
            getLabel: false,
            serviceType: "fedex_international_priority"
          }
        }
      });

      debug("rates %o", response);
      const errors = JSON.parse(response.body.error.message);
      expect(errors[0]).to.have.property("info");
      expect(errors[0].info).to.be.equal(
        "City must not have less than two characters"
      );
      expect(response.statusCode).to.be.equal(500);
    });

    it("should throw an error when invalid state name is provided when creating a shipment, lable or getting rates", async () => {
      const response = await api.rest({
        ...envFile,
        type: "rates",
        request: {
          type: "postmen",
          shipment: {
            ...shipmentTesting,
            shipment: {
              ...shipmentTesting.shipment,
              shipTo: {
                ...shipmentTesting.shipment.shipTo,
                state: "c"
              }
            },
            getLabel: false,
            serviceType: "fedex_international_priority"
          }
        }
      });

      debug("rates %o", response);
      const errors = JSON.parse(response.body.error.message);
      expect(errors[0]).to.have.property("info");
      expect(errors[0].info).to.be.equal(
        "State must not have less than two characters"
      );
      expect(response.statusCode).to.be.equal(500);
    });

    it("should throw an error when invalid correct country code is provided when creating a shipment, lable or getting rates", async () => {
      const response = await api.rest({
        ...envFile,
        type: "rates",
        request: {
          type: "postmen",
          shipment: {
            ...shipmentTesting,
            shipment: {
              ...shipmentTesting.shipment,
              shipTo: {
                ...shipmentTesting.shipment.shipTo,
                countryCode: "USA"
              }
            },
            getLabel: false,
            serviceType: "fedex_international_priority"
          }
        }
      });

      debug("rates %o", response);
      const errors = JSON.parse(response.body.error.message);
      expect(errors[0]).to.have.property("info");
      expect(errors[0].info).to.be.equal(
        "Must provide a valid country code e.g AT"
      );
      expect(response.statusCode).to.be.equal(500);
    });

    it("should throw an error when wrong service api is selected", async () => {
      const response = await api.rest({
        ...envFile,
        type: "rates",
        request: {
          type: "none",
          shipment: {
            ...shipmentTesting,
            getLabel: false,
            serviceType: "fedex_international_priority"
          }
        }
      });

      debug("rates %o", response);
      expect(response.body.error).to.have.property("message");
      expect(response.body.error.message).to.be.equal(
        "you must select a service (postmen/goshippo/dhl)"
      );
      expect(response.statusCode).to.be.equal(400);
    });

    it("should throw an error when parcel array is empty when creating a shipment, lable or getting rates", async () => {
      const response = await api.rest({
        ...envFile,
        type: "rates",
        request: {
          type: "postmen",
          shipment: {
            ...shipmentTesting,
            shipment: {
              ...shipmentTesting.shipment,
              parcels: []
            },
            getLabel: false,
            serviceType: "fedex_international_priority"
          }
        }
      });

      debug("rates %o", response);
      const errors = JSON.parse(response.body.error.message);
      expect(errors[0]).to.have.property("info");
      expect(errors[0].info).to.be.equal("must NOT have fewer than 1 items");
      expect(response.statusCode).to.be.equal(500);
    });

    it("should throw an error when parcel items array is empty when creating a shipment, lable or getting rates", async () => {
      const response = await api.rest({
        ...envFile,
        type: "rates",
        request: {
          type: "postmen",
          shipment: {
            ...shipmentTesting,
            shipment: {
              ...shipmentTesting.shipment,
              parcels: [{}]
            },
            getLabel: false,
            serviceType: "fedex_international_priority"
          }
        }
      });

      debug("rates %o", response);
      const errors = JSON.parse(response.body.error.message);
      expect(errors[0]).to.have.property("info");
      expect(errors[1]).to.have.property("info");
      expect(errors[2]).to.have.property("info");
      expect(errors[3]).to.have.property("info");
      expect(errors[4]).to.have.property("info");
      expect(errors[5]).to.have.property("info");
      expect(errors[6]).to.have.property("info");
      expect(errors[7]).to.have.property("info");
      expect(errors[8]).to.have.property("info");
      expect(errors[0].info).to.be.equal(
        "must have required property 'description'"
      );
      expect(errors[1].info).to.be.equal(
        "must have required property 'length'"
      );
      expect(errors[2].info).to.be.equal("must have required property 'width'");
      expect(errors[3].info).to.be.equal(
        "must have required property 'height'"
      );
      expect(errors[4].info).to.be.equal(
        "must have required property 'distanceUnit'"
      );
      expect(errors[5].info).to.be.equal(
        "must have required property 'boxType'"
      );
      expect(errors[6].info).to.be.equal(
        "must have required property 'weight'"
      );
      expect(errors[7].info).to.be.equal(
        "must have required property 'dimension'"
      );
      expect(errors[8].info).to.be.equal("must have required property 'items'");
      expect(response.statusCode).to.be.equal(500);
    });
  });
});
