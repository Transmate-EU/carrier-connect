/* eslint-disable mocha/no-mocha-arrows */
import { expect } from "chai";
import {
  shipmentAddress,
  shipmentManifest,
  shipmentTesting
} from "../../data/data";
import resolvers from "../../resolvers/resolvers";
import { envFile } from "../data/test.data";

describe("Testing postmen Resolvers", () => {
  let postmenLabel;

  describe("Get postmen rates", () => {
    it("should get create shipment, get rates and a label", async () => {
      const postmenShipment = await resolvers.Mutation.createShipment(
        null,
        {
          type: "postmen",
          shipment: {
            ...shipmentTesting,
            shipment: {
              ...shipmentTesting.shipment,
              shipFrom: {
                ...shipmentTesting.shipment.shipFrom,
                street1: "5/F Hull Lane",
                city: "Sham Shui Po",
                postalCode: null,
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
        },
        envFile
      );
      postmenLabel = postmenShipment.label;
      expect(postmenShipment).to.have.property("rates");
      expect(postmenShipment).to.have.property("label");
      expect(postmenShipment.rates[0]).to.have.property("totalCharge");
    });
    it("should not get all rates when not provided shipment", async () => {
      try {
        await resolvers.Mutation.createShipment(
          null,
          { type: "postmen", shipment: {} },
          envFile
        );
      } catch (error) {
        const errorInArray = JSON.parse(error.message);
        expect(errorInArray.length).to.have.to.be.greaterThan(0);
        expect(errorInArray[0]).to.be.equal(
          "Cannot destructure property 'shipFrom' of 'requestObject.shipment' as it is undefined."
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
      expect(postmenLabels[0]).to.have.property("rate");
      expect(postmenLabels[0].rate).to.have.property("totalCharge");
    });
  });

  describe("Validate postmen address", () => {
    it("should validate provided address", async () => {
      const postmenAddy = await resolvers.Mutation.validateAddress(
        null,
        { type: "postmen", address: shipmentAddress },
        envFile
      );
      expect(postmenAddy).to.have.property("id");
      expect(postmenAddy).to.have.property("status");
      expect(postmenAddy.status).to.have.be.equal("valid");
      expect(postmenAddy).to.have.property("createdAt");
      expect(postmenAddy).to.have.property("updatedAt");
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
        expect(errorInArray[0].message).to.be.equal(
          "should have required property 'street1'"
        );
      }
    });
  });

  describe("Get postmen manifest", () => {
    it("should not get postmen mainfest details if not provided manifest", async () => {
      try {
        await resolvers.Query.manifest(
          null,
          { type: "postmen", manifestId: "jiji" },
          envFile
        );
      } catch (error) {
        const errorInArray = JSON.parse(error.message);
        expect(errorInArray.length).to.be.greaterThan(0);
        expect(errorInArray[0]).to.be.equal("Item does not exist.");
      }
    });

    it("should get postmen mainfest details if manifest id is provided", async () => {
      await resolvers.Mutation.createManifest(
        null,
        { type: "postmen", manifest: shipmentManifest },
        envFile
      );
      const manifests = await resolvers.Query.manifests(
        null,
        { type: "postmen" },
        envFile
      );
      const manifest = await resolvers.Query.manifest(
        null,
        { type: "postmen", manifestId: manifests[0].id },
        envFile
      );
      expect(manifest).to.have.property("id");
      expect(manifest).to.have.property("status");
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
        expect(errorInArray[0]).to.be.equal("Item not found");
      }
    });
  });
});
