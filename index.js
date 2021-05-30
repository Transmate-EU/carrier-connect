import Shipment from "./controller/shipment";

const { rest } = require("./functions/rest");
const { gqlResolve } = require("./functions/graphql");

export { Shipment, rest, gqlResolve };
