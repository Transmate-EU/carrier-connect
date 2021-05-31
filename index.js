import Shipment from "./controller/shipment";
// testing data
import { shippoShipmentTesting } from "./data/shippo";

const { rest } = require("./functions/rest");
const { gqlResolve } = require("./functions/graphql");

export { Shipment, rest, gqlResolve, shippoShipmentTesting };
