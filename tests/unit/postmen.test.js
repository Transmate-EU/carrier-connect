/* eslint-disable mocha/no-mocha-arrows */
import { expect } from "chai";
import { shipmentAddress, shipmentTesting } from "../../data/data";
import resolvers from "../../resolvers/resolvers";
import { envFile } from "../data/test.data";

describe("Testing postmen Resolvers", () => {
  let postmenLabel;
  let postmenManifest;

  describe("Get Postmen rates and create labels", () => {
    it("should create label for shipment USA -> HKG using USPS", async () => {
      const response = await resolvers.Mutation.createLabel(
        null,
        {
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
            getLabel: false,
            serviceType: "usps-discounted_express_mail_international"
          }
        },
        {
          ...envFile,
          SHIPPER_ACCOUNT_ID: "3ba41ff5-59a7-4ff0-8333-64a4375c7f21"
        }
      );
      postmenLabel = response;
      expect(response).to.have.property("status");
      expect(response).to.have.property("labelUrl");
      expect(response.status).to.have.be.equal("created");
      expect(response).to.have.property("createdAt");
    });
    it("should get rates for shipment USA -> HKG using USPS", async () => {
      const response = await resolvers.Query.rates(
        null,
        {
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
            getLabel: false,
            serviceType: "usps-discounted_express_mail_international"
          }
        },
        {
          ...envFile,
          SHIPPER_ACCOUNT_ID: "3ba41ff5-59a7-4ff0-8333-64a4375c7f21"
        }
      );
      expect(response[0]).to.have.property("status");
      expect(response[0]).to.have.property("id");
      expect(response[0].status).to.have.be.equal("calculated");
      expect(response[0]).to.have.property("deliveryDate");
    });
    it("should not get rates when not provided shipment", async () => {
      try {
        await resolvers.Mutation.createShipment(
          null,
          { type: "postmen", shipment: {} },
          envFile
        );
      } catch (error) {
        const errorInArray = JSON.parse(error.message);
        expect(errorInArray.length).to.have.to.be.greaterThan(0);
        expect(errorInArray[0].info).to.be.equal(
          "must have required property 'shipment'"
        );
      }
    });
  });

  describe("Get postmen labels", () => {
    it("should get labels", async () => {
      const postmenLabels = await resolvers.Query.labels(
        null,
        { type: "postmen" },
        envFile
      );
      expect(postmenLabels[0]).to.have.property("id");
      expect(postmenLabels[0]).to.have.property("status");
      expect(postmenLabels[0]).to.have.property("labelUrl");
    });
  });

  describe("Validate postmen address", () => {
    it("should validate provided address", async () => {
      const postmenAddy = await resolvers.Mutation.validateAddress(
        null,
        { type: "postmen", address: shipmentAddress },
        envFile
      );
      expect(postmenAddy.address).to.have.property("status");
      expect(postmenAddy.address.status).to.have.be.equal("valid");
    });

    it("should not validate address if not provided a body", async () => {
      try {
        await resolvers.Mutation.validateAddress(
          null,
          { type: "postmen", address: {} },
          envFile
        );
      } catch (error) {
        const errorInArray = JSON.parse(error.message);
        expect(errorInArray.length).to.be.greaterThan(0);
        expect(errorInArray[0].info).to.be.equal(
          "data.address.street1 is a required property"
        );
        expect(errorInArray[1].info).to.be.equal(
          "data.address.country is a required property"
        );
      }
    });
  });

  describe("Get create and get a postmen manifest", () => {
    it("should create a postmen manifest", async () => {
      const manifest = await resolvers.Mutation.createManifest(
        null,
        {
          type: "postmen",
          manifest: {
            shipperManifestAccountId: "3ba41ff5-59a7-4ff0-8333-64a4375c7f21",
            labelIds: [postmenLabel.id]
          }
        },
        envFile
      );
      postmenManifest = manifest;
      expect(manifest).to.have.property("id");
      expect(manifest).to.have.property("status");
      expect(manifest.status).to.be.equal("manifesting");
    });

    it("should get postmen mainfest details if manifest id is provided", async () => {
      const manifest = await resolvers.Query.manifest(
        null,
        {
          type: "postmen",
          manifestId: postmenManifest.id
        },
        envFile
      );
      expect(manifest).to.have.property("id");
      expect(manifest).to.have.property("status");
    });

    it("should not get postmen mainfest details if not provided right manifest id", async () => {
      try {
        await resolvers.Query.manifest(
          null,
          { type: "postmen", manifestId: "jiji" },
          envFile
        );
      } catch (error) {
        const errorInArray = JSON.parse(error.message);
        expect(errorInArray.length).to.be.greaterThan(0);
        expect(errorInArray[0].info).to.be.equal("Item does not exist.");
      }
    });
  });

  describe("Cancel/delete postmen label", () => {
    it("should cancel postmen label if not provided label id", async () => {
      const canceledLabel = await resolvers.Mutation.cancelOrDeleteLabel(
        null,
        { type: "postmen", labelId: postmenLabel.id },
        envFile
      );
      expect(canceledLabel).to.have.property("id");
      expect(canceledLabel).to.have.property("status");
      expect(canceledLabel.status).to.be.equal("cancelled");
    });
    it("should not cancel postmen label if not provided label id", async () => {
      try {
        await resolvers.Mutation.cancelOrDeleteLabel(
          null,
          { type: "postmen", labelId: "as" },
          envFile
        );
      } catch (error) {
        const errorInArray = JSON.parse(error.message);
        expect(errorInArray.length).to.be.greaterThan(0);
        expect(errorInArray[0].info).to.be.equal("Item not found");
      }
    });
  });
});
