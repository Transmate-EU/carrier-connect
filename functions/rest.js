import Call from "../controller/shipment";

const debug = require("debug")("restEndpoint");

async function rest(params) {
  let result;
  let statusCode = 400 ;
  let warnings;
  let response;
  debug("rest call with params %o ", params);

  const { type, request } = params;

  try {
    if (typeof request !== "object") throw Error("missing request obj!");
    const apiCall = new Call(request.type, params);
    switch (true) {
      case type === "rates":
        response = await apiCall.getRates(request.shipment);

        result = response.data.rates;
        break;
      case type === "labels":
        response = await apiCall.getLabels();

        result = response.data.labels;
        break;
      case type === "manifests":
        response = await apiCall.getAllManifests();

        result = response.data.manifests;
        break;
      case type === "manifest":
        response = await apiCall.getManifest(request.manifestId);

        result = response.data;
        break;
      case type === "trackings":
        response = await apiCall.getTrackings();

        result = response.data.trackings;
        break;
      case type === "trackingStatus":
        response = await apiCall.getTracking(request.tracking);

        result = response.data.tracking;
        break;
      case type === "shipments":
        response = await apiCall.getShipments();

        result = response.data.shipments;
        break;
      case type === "createShipment":
        response = await apiCall.createShipment(request.shipment);

        result = response.data.shipment;
        break;
      case type === "validateAddress":
        response = await apiCall.validateAddress(request.address);

        result = response.data;
        break;
      case type === "createLabel":
        response = await apiCall.createLabel(request.label);

        result = response.data;
        break;
      case type === "createManifest":
        response = await apiCall.createManifest(request.manifest);

        result = response.data;
        break;
      case type === "createTracking":
        response = await apiCall.createTracking(request.tracking);

        result = response.data.tracking;
        break;
      case type === "cancelOrDeleteLabel":
        response = await apiCall.deleteLabel(request.labelId);

        result = response.data;
        break;
      case type === "createAddress":
        response = await apiCall.createAddress(request.address);

        result = response.data.address;
        break;
      default:
        statusCode = 400;
        throw new Error("Unknown type used");
    }
    if (response.errors.length > 0) {
      statusCode = 500;
      throw new Error(JSON.stringify(response.errors));
    }
  } catch (error) {
    return {
      body: {
        error: {
          code: "issue with function!",
          message: error.message,
          request,
          type
        }
      },
      statusCode,
      headers: { "Content-Type": "application/json" }
    };
  }

  return {
    body: {
      result,
      warnings
    },
    statusCode: 200,
    headers: { "Content-Type": "application/json" }
  };
}

export { rest };
