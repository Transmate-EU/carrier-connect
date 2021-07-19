/* eslint-disable prettier/prettier */
/* eslint-disable prefer-destructuring */
/* eslint-disable global-require */
/* eslint-disable mocha/no-mocha-arrows */

import { expect } from "chai";
import { shipmentAddress, shipmentTesting } from "../../data/data";
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

describe("Test postmen REST API", () => {
  describe("should test(labels, rates, manifest and shipments)", () => {
    let postmenLabel;
    let postmenLabels;
    let postmenLabelOne;
    let postmenManifest;

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
      expect(response.body.error).to.have.property("message");
      expect(response.body.error.message).to.be.equal("please provide postmen API key!");
      expect(response.statusCode).to.be.equal(400);
    });

    it("should not create label for shipment when given wrong service type", async () => {
      const response = await api.rest({
        ...envFile,
        SHIPPER_ACCOUNT_ID: "3ba41ff5-59a7-4ff0-8333-64a4375c7f21",
        type: "createlabel",
        request: {
          type: "postmen",
          shipment: {
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
            getLabel: true,
            serviceType: "usps-discounted_express_mail_internationax"
          }
        }
      });
      const errors = JSON.parse(response.body.error.message);
      expect(errors[0]).to.have.property("info");
      expect(errors[0].info).to.be.equal(
        "data.service_type should be equal to one of values [\"usps-discounted_express_mail\",\"usps-discounted_express_mail_international\",\"usps-discounted_first_class_package\",\"usps-discounted_first_class_package_international\",\"usps-discounted_library_mail\",\"usps-discounted_media_mail\",\"usps-discounted_parcel_select_ground\",\"usps-discounted_priority_mail\",\"usps-discounted_priority_mail_international\"]"
      );
      expect(response.statusCode).to.be.equal(500);
    });

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
                postalCode: "999077",
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
      postmenLabelOne = response.body.result.label;
      expect(response.body.result).to.have.property("label");
      expect(response.body.result).to.have.property("rates");
      expect(response.body.result.label).to.have.property("id");
      expect(response.body.result.rates[0]).to.have.property("totalCharge");
      expect(response.statusCode).to.be.equal(200);
    });

    it("should not create label when creating a shipment", async () => {
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
                postalCode: "999077",
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
            getLabel: false,
            serviceType: "fedex_international_priority"
          }
        }
      });
      expect(response.body.result).to.have.property("label");
      expect(response.body.result.label).to.be.equal(null);
    });

    it("should get rates when given shipment for fedex service type", async () => {
      const response = await api.rest({
        ...envFile,
        type: "rates",
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
                postalCode: "999077",
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
            getLabel: false,
            serviceType: "fedex_international_priority"
          }
        }
      });
      expect(response.body.result[0]).to.have.property("status");
      expect(response.body.result[0].status).to.be.equal("calculated");
      expect(response.body.result[0]).to.have.property("totalCharge");
      expect(response.statusCode).to.be.equal(200);
    });

    it("should create label for shipment USA -> HKG using USPS", async () => {
      const response = await api.rest({
        ...envFile,
        SHIPPER_ACCOUNT_ID: "3ba41ff5-59a7-4ff0-8333-64a4375c7f21",
        type: "createlabel",
        request: {
          type: "postmen",
          shipment: {
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
            getLabel: true,
            serviceType: "usps-discounted_express_mail_international"
          }
        }
      });
      postmenLabel = response.body.result;
      expect(response.body.result).to.have.property("status");
      expect(response.body.result).to.have.property("labelUrl");
      expect(response.body.result.status).to.have.be.equal("created");
      expect(response.body.result).to.have.property("createdAt");
    });

    it("should create manifest for usps label", async () => {
      const response = await api.rest({
        ...envFile,
        type: "createmanifest",
        request: {
          type: "postmen",
          manifest: {
            shipperManifestAccountId: "3ba41ff5-59a7-4ff0-8333-64a4375c7f21",
            labelIds: [postmenLabel.id]
          }
        }
      });
      postmenManifest = response.body.result
      expect(response.body.result).to.have.property("id");
      expect(response.body.result).to.have.property("status");
      expect(response.body.result).to.have.property("createdAt");
      expect(response.body.result).to.have.property("updatedAt");
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
      expect(response.body.result).to.have.property("status");
      expect(response.body.result.status).to.have.be.equal("valid");
      expect(response.body.result).to.have.property("createdAt");
    });

    it("should get manifests", async () => {
      const response = await api.rest({
        ...envFile,
        type: "manifests",
        request: {
          type: "postmen"
        }
      });
      expect(response.body.result[0]).to.have.property("id");
      expect(response.body.result[0]).to.have.property("status");
      expect(response.statusCode).to.be.equal(200);
    });

    it("should get created manifest for shipment USA -> HKG using USPS", async () => {
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
      expect(response.statusCode).to.be.equal(200);
    });

    it("should not cancel fedex label that does not exists", async () => {
      const response = await api.rest({
        ...envFile,
        type: "cancelordeleteLabel",
        request: {
          type: "postmen",
          labelId: "postmenLabelOne.id"
        }
      });
      const errors = JSON.parse(response.body.error.message);
      expect(errors[0]).to.be.equal("Item not found");
      expect(response.statusCode).to.be.equal(500);
    });

    it("should cancel fedex label", async () => {
      const response = await api.rest({
        ...envFile,
        type: "cancelordeleteLabel",
        request: {
          type: "postmen",
           labelId: postmenLabelOne.id
        }
      });
      expect(response.body.result).to.have.property("id");
      expect(response.body.result).to.have.property("status");
      expect(response.body.result.status).to.be.equal("cancelled");
      expect(response.statusCode).to.be.equal(200);
    });
  });
});
