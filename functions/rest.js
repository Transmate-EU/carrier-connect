import Call from "../controller/shipment";

const debug = require("debug")("restEndpoint");

async function rest(params) {
  let result;
  let statusCode = 400;
  const headers = { "Content-Type": "application/json" };
  let warnings;
  let response;
  debug("rest call with params %o ", params);

  const { type, request } = params;

  try {
    if (typeof request !== "object") throw Error("missing request obj!");
    const apiCall = new Call(request.type, params);
    switch ((type || "").toLowerCase()) {
      case "rates":
        response = await apiCall.getRates(request.shipment);
        result = response.data.rates;
        warnings = response.data.warnings;
        break;
      case "labels":
        response = await apiCall.getLabels();
        result = response.data.labels;
        warnings = response.data.warnings;
        break;
      case "manifests":
        response = await apiCall.getAllManifests();
        result = response.data.manifests;
        warnings = response.warnings;
        break;
      case "manifest":
        response = await apiCall.getManifest(request.manifestId);
        result = response.data.manifest;
        warnings = response.warnings;
        break;
      case "trackings":
        response = await apiCall.getTrackings();
        result = response.data.trackings;
        warnings = response.warnings;
        break;
      case "trackingstatus":
        response = await apiCall.getTracking(request.tracking);
        result = response.data.tracking;
        warnings = response.warnings;
        break;
      case "shipments":
        response = await apiCall.getShipments();
        result = response.data.shipments;
        warnings = response.warnings;
        break;
      case "createshipment":
        response = await apiCall.createShipment(request.shipment);
        result = response.data.shipment;
        warnings = response.warnings;
        break;
      case "validateaddress":
        response = await apiCall.validateAddress(request.address);
        result = response.data.address;
        warnings = response.warnings;
        break;
      case "createlabel":
        response = await apiCall.createLabel(request.shipment);
        result = response.data.label;
        warnings = response.warnings;
        break;
      case "createmanifest":
        response = await apiCall.createManifest(request.manifest);
        result = response.data.manifest;
        warnings = response.warnings;
        break;
      case "createtracking":
        response = await apiCall.createTracking(request.tracking);
        result = response.data.tracking;
        warnings = response.warnings;
        break;
      case "cancelordeletelabel":
        response = await apiCall.deleteLabel(request.labelId);
        result = response.data.label;
        warnings = response.warnings;
        break;
      case "createaddress":
        response = await apiCall.createAddress(request.address);
        result = response.data.address;
        warnings = response.warnings;
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
      headers
    };
  }

  return {
    body: {
      result,
      warnings
    },
    statusCode: 200,
    headers
  };
}

export { rest };
