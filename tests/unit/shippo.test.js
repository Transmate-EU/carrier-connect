/* eslint-disable mocha/no-mocha-arrows */
import { expect } from "chai";
import { shipmentAddress, shipmentTesting } from "../../data/data";
import resolvers from "../../resolvers/resolvers";
import { envFile } from "../data/test.data";

describe("Testing goshippo Resolvers", () => {
  let shippoLabel;

  describe("Get Postmen rates and create labels", () => {
    it("should create label when provided a shipment", async () => {
      const response = await resolvers.Mutation.createLabel(
        null,
        {
          type: "shippo",
          shipment: {
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
                contactName: "testing",
                street1: "4901 N New Hope Rd Apt C1",
                city: "Raleigh",
                state: "NC",
                postalCode: "27604",
                countryCode: "US",
                type: "business",
                phone: "17578976058",
                email: "testing@gmail.com"
              }
            },
            getLabel: false,
            serviceType: "usps_priority_express"
          }
        },
        {
          ...envFile,
          SHIPPER_ACCOUNT_ID: envFile.SHIPPO_TEST_SHIPPER_ACCOUNT
        }
      );
      shippoLabel = response;
      expect(response).to.have.property("status");
      expect(response).to.have.property("labelUrl");
      expect(response.status).to.have.be.equal("created");
      expect(response).to.have.property("createdAt");
    });
  });

  describe("Get goshippo validate address", () => {
    it("should create and  validate address", async () => {
      const validatedAddress = await resolvers.Mutation.validateAddress(
        null,
        { type: "shippo", address: shipmentAddress },
        envFile
      );
      expect(validatedAddress.address.isComplete).to.have.be.equal(true);
      expect(validatedAddress.address.validationResults).to.have.property(
        "isValid"
      );
      expect(
        validatedAddress.address.validationResults.isValid
      ).to.have.be.equal(true);
    });

    it("should not create address when address body is not provided", async () => {
      try {
        await resolvers.Mutation.createAddress(
          null,
          { type: "shippo", address: {} },
          envFile
        );
      } catch (error) {
        const errorInArray = JSON.parse(error.message);
        expect(errorInArray.length).to.be.greaterThan(0);
        expect(errorInArray[0].info).to.be.equal(
          "In order to create an Address, at least a country must be provided."
        );
      }
    });
  });

  describe("Refund/Cancel label", () => {
    it("should cancel label when provided label id", async () => {
      const canceledLabel = await resolvers.Mutation.cancelOrDeleteLabel(
        null,
        { type: "shippo", labelId: shippoLabel.id },
        envFile
      );
      expect(canceledLabel).to.have.property("id");
      expect(canceledLabel).to.have.property("status");
    });
    it("should not cancel goshippo label if wrong id is provided", async () => {
      try {
        await resolvers.Mutation.cancelOrDeleteLabel(
          null,
          { type: "shippo", labelId: "label.id" },
          envFile
        );
      } catch (error) {
        const errorInArray = JSON.parse(error.message);
        expect(errorInArray.length).to.have.to.be.greaterThan(0);
        expect(errorInArray[0].info).to.be.equal(
          "Transaction with supplied object_id not found."
        );
      }
    });
  });
});
