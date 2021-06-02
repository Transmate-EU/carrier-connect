/* eslint-disable global-require */
/* eslint-disable mocha/no-mocha-arrows */

import { expect } from "chai";

import {
  postmenAddress,
  postmenCalculateRate,
  postmenCreateLabel,
  postmenManifestReq
} from "../../data/postmen";

const debug = require("debug")("test:postment:rest");

let api;

console.log("test api rest");
if (process.env.WEBPACK_TEST) {
  api = require("../../dist/rest-local.js");
  console.log("webpack test", "api", api);
} else {
  api = require("../../functions/rest.js");
  console.log("normal test", "api", api);
}

const envFile = require("../../.env.json");

describe("Test postmen REST API", () => {
  describe("should test(labels, rates, manifest and shipments)", () => {
    let postmenLabel;
    let postmenLabels;
    let postmenManifest;

    it("should create label", async () => {
      const response = await api.rest({
        ...envFile,
        type: "createLabel",
        request: {
          type: "postmen",
          label: postmenCreateLabel
        }
      });
      postmenLabel = response.body.result;
      expect(postmenLabel).to.have.property("id");
      expect(postmenLabel).to.have.property("status");
      expect(postmenLabel.status).to.be.equal("created");
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
      expect(postmenLabels[0]).to.have.property("rate");
      expect(postmenLabels[0].rate).to.have.property("totalCharge");
      expect(response.statusCode).to.be.equal(200);
    });

    it("should validate address", async () => {
      const response = await api.rest({
        ...envFile,
        type: "validateAddress",
        request: {
          type: "postmen",
          address: postmenAddress
        }
      });

      expect(response.body.result).to.have.property("id");
      expect(response.body.result).to.have.property("status");
      expect(response.body.result.status).to.have.be.equal("valid");
      expect(response.body.result).to.have.property("createdAt");
      expect(response.body.result).to.have.property("updatedAt");
    });

    it("should cancel label", async () => {
      const response = await api.rest({
        ...envFile,
        type: "cancelOrDeleteLabel",
        request: {
          type: "postmen",
          labelId: postmenLabel.id
        }
      });

      expect(response.body.result).to.have.property("id");
      expect(response.body.result).to.have.property("status");
      expect(response.body.result.status).to.be.equal("cancelled");
      expect(response.statusCode).to.be.equal(200);
    });

    it("should calculate rates given a shipment", async () => {
      const response = await api.rest({
        ...envFile,
        type: "rates",
        request: {
          type: "postmen",
          shipment: postmenCalculateRate
        }
      });
      debug("rates %o", response);
      expect(response.body.result[0]).to.have.property("chargeWeight");
      expect(response.body.result[0]).to.have.property("totalCharge");
      // expect(response.body.result[0].totalCharge).to.have.property("amount");
      expect(response.statusCode).to.be.equal(200);
    });

    it("should create manifest", async () => {
      const response = await api.rest({
        ...envFile,
        type: "createManifest",
        request: {
          type: "postmen",
          manifest: postmenManifestReq
        }
      });

      postmenManifest = response.body.result;
      expect(postmenManifest).to.have.property("id");
      expect(postmenManifest).to.have.property("status");
      expect(postmenManifest).to.have.property("createdAt");
      expect(response.statusCode).to.be.equal(200);
    });

    it("should get created manifest", async () => {
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
      expect(response.body.result).to.have.property("createdAt");
      expect(response.statusCode).to.be.equal(200);
    });
  });
});