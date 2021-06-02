// /* eslint-disable global-require */
// /* eslint-disable mocha/no-mocha-arrows */

// import { expect } from "chai";
// import { ratesObject, shipmentObject, envFile } from "../data/test.data";

// let api;

// console.log("test api rest");
// if (process.env.WEBPACK_TEST) {
//   api = require("../../dist/rest-local.js");
//   console.log("webpack test", "api", api);
// } else {
//   api = require("../../functions/rest.js");
//   console.log("normal test", "api", api);
// }

// describe("Test DHL REST API", () => {
//   describe("should test(labels, rates, and trackings)", () => {
//     let dhlLabel;
//     let dhlRatings;
//     let dhlShipment;
//     let dhlTrackingNumber;

//     it("should create label", async () => {
//       const response = await api.rest({
//         ...envFile,
//         type: "createLabel",
//         request: {
//           type: "dhl",
//           label: shipmentObject
//         }
//       });
//       dhlLabel = response.body.result;
//       expect(dhlLabel).to.have.property("shipmentIdentificationNumber");
//       expect(dhlLabel).to.have.property("dispatchConfirmationNumber");
//       expect(dhlLabel.labelImageFormat).to.be.equal("PDF");
//       expect(dhlLabel).to.be.property("trackingNumbers");
//       expect(response.statusCode).to.be.equal(200);
//     });

//     it("should create shipment", async () => {
//       const response = await api.rest({
//         ...envFile,
//         type: "createshipment",
//         request: {
//           type: "dhl",
//           shipment: shipmentObject
//         }
//       });
//       dhlShipment = response.body.result;
//       dhlTrackingNumber = dhlShipment.shipmentIdentificationNumber;
//       expect(dhlShipment).to.have.property("shipmentIdentificationNumber");
//       expect(dhlShipment).to.have.property("dispatchConfirmationNumber");
//       expect(dhlShipment.labelImageFormat).to.be.equal("PDF");
//       expect(dhlShipment).to.be.property("trackingNumber");
//       expect(response.statusCode).to.be.equal(200);
//     });

//     it("should get rates", async () => {
//       const response = await api.rest({
//         ...envFile,
//         type: "rates",
//         request: {
//           type: "dhl",
//           shipment: ratesObject
//         }
//       });
//       dhlRatings = response.body.result;
//       expect(dhlRatings[0]).to.have.property("serviceName");
//       expect(dhlRatings[0].serviceName).to.be.equal("dhl");
//       expect(dhlRatings[0]).to.have.property("totalCharge");
//       expect(dhlRatings[0].totalCharge).to.have.property("amount");
//       expect(dhlRatings[0].totalCharge).to.have.property("currency");
//       expect(response.statusCode).to.be.equal(200);
//     });

//     it("should get tracking", async () => {
//       const response = await api.rest({
//         ...envFile,
//         type: "trackingstatus",
//         request: {
//           type: "dhl",
//           tracking: {
//             trackingNumber: dhlTrackingNumber,
//             shipperAccount: ratesObject.shipperAccount
//           }
//         }
//       });
//       const tracking = response.body.result;
//       expect(tracking).to.have.property("shipmentWeight");
//       expect(tracking).to.have.property("shipmentWeightUnit");
//       expect(tracking).to.have.property("shipmentPackageCount");
//       expect(tracking).to.have.property("messageReference");
//       expect(tracking.shipmentWeightUnit).to.be.equal("K");
//       expect(response.statusCode).to.be.equal(200);
//     });
//   });
// });
