import Shipment from "./controller/shipment";
// testing data
import { shippoShipmentTesting } from "./data/shippo";

const { rest } = require("./functions/rest");
const { gqlResolve } = require("./functions/graphql");

exports.Shipment = Shipment;
exports.gqlResolve = gqlResolve;
exports.shippoShipmentTesting = shippoShipmentTesting;
exports.rest = rest;
