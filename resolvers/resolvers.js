import Shipment from "../controller/shipment";

const debug = require("debug")("resolver");

function getContext(context) {
  debug("context %o", context);
  if (typeof context === "function") {
    return process.env;
  }

  if (typeof context === "object") {
    console.log("context is object");
    return context;
  }
  return null;
}

const resolvers = {
  Query: {
    labels: async (parent, args, context) => {
      const apiCall = new Shipment(args.type, getContext(context));
      const labels = await apiCall.getLabels();
      if (labels.errors.length > 0) {
        throw new Error(JSON.stringify(labels.errors));
      }
      return labels.data.labels;
    },
    manifests: async (parent, args, context) => {
      const apiCall = new Shipment(args.type, getContext(context));
      const manifests = await apiCall.getAllManifests();
      if (manifests.errors.length > 0) {
        throw new Error(JSON.stringify(manifests.errors));
      }
      return manifests.data.manifests;
    },
    manifest: async (parent, args, context) => {
      const apiCall = new Shipment(args.type, getContext(context));
      const manifest = await apiCall.getManifest(args.manifestId);
      if (manifest.errors.length > 0) {
        throw new Error(JSON.stringify(manifest.errors));
      }
      return manifest.data;
    },
    trackings: async (parent, args, context) => {
      const apiCall = new Shipment(args.type, getContext(context));
      const trackings = await apiCall.getTrackings();
      if (trackings.errors.length > 0) {
        throw new Error(JSON.stringify(trackings.errors));
      }
      return trackings.data.trackings;
    },
    trackingStatus: async (parent, args, context) => {
      const apiCall = new Shipment(args.type, getContext(context));
      const tracking = await apiCall.getTracking(args.tracking);
      if (tracking.errors.length > 0) {
        throw new Error(JSON.stringify(tracking.errors));
      }
      return tracking.data.tracking;
    },
    shipments: async (parent, args, context) => {
      const apiCall = new Shipment(args.type, getContext(context));
      const shipments = await apiCall.getShipments();
      if (shipments.errors.length > 0) {
        throw new Error(JSON.stringify(shipments.errors));
      }
      return shipments.data.shipments;
    }
  },
  Mutation: {
    createShipment: async (parent, args, context) => {
      const apiCall = new Shipment(args.type, getContext(context));
      const shipment = await apiCall.createShipment(args.shipment);
      if (shipment.errors.length > 0) {
        throw new Error(JSON.stringify(shipment.errors));
      }
      return shipment.data.shipment;
    },
    validateAddress: async (parent, args, context) => {
      const apiCall = new Shipment(args.type, getContext(context));
      const address = await apiCall.validateAddress(args.address);
      if (address.errors.length > 0) {
        throw new Error(JSON.stringify(address.errors));
      }
      return address.data;
    },
    createLabel: async (parent, args, context) => {
      const apiCall = new Shipment(args.type, getContext(context));
      const label = await apiCall.createLabel(args.shipment);
      if (label.errors.length > 0) {
        throw new Error(JSON.stringify(label.errors));
      }
      return label.data.label;
    },
    createManifest: async (parent, args, context) => {
      const apiCall = new Shipment(args.type, getContext(context));
      const manifest = await apiCall.createManifest(args.manifest);
      if (manifest.errors.length > 0) {
        throw new Error(JSON.stringify(manifest.errors));
      }
      return manifest.data;
    },
    createTracking: async (parent, args, context) => {
      const apiCall = new Shipment(args.type, getContext(context));
      const tracking = await apiCall.createTracking(args.tracking);
      if (tracking.errors.length > 0) {
        throw new Error(JSON.stringify(tracking.errors));
      }
      return tracking.data.tracking;
    },
    cancelOrDeleteLabel: async (parent, args, context) => {
      const apiCall = new Shipment(args.type, getContext(context));
      const label = await apiCall.deleteLabel(args.labelId);
      if (label.errors.length > 0) {
        throw new Error(JSON.stringify(label.errors));
      }
      return label.data;
    },
    createAddress: async (parent, args, context) => {
      const apiCall = new Shipment(args.type, getContext(context));
      const address = await apiCall.createAddress(args.address);
      if (address.errors.length > 0) {
        throw new Error(JSON.stringify(address.errors));
      }
      return address.data.address;
    }
  }
};

export default resolvers;
