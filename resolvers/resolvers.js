import Shipment from "../controller/shipment";

const debug = require("debug")("resolver");

function getContext(context) {
  debug("context %o", context);
  if (typeof context === "function") {
    // context();
    return process.env;
  }

  if (typeof context === "object") {
    // setEnv(context);
    return context;
  }
  return null;
}

const resolvers = {
  Query: {
    rates: async (parent, args, context) => {
      const rates = await new Shipment(args.type, getContext(context)).getRates(
        args.shipment
      );
      if (rates.errors.length > 0) {
        throw new Error(JSON.stringify(rates.errors));
      }
      return rates.data.rates;
    },
    labels: async (parent, args, context) => {
      const labels = await new Shipment(
        args.type,
        getContext(context)
      ).getLabels();
      if (labels.errors.length > 0) {
        throw new Error(JSON.stringify(labels.errors));
      }
      return labels.data.labels;
    },
    manifests: async (parent, args, context) => {
      const manifests = await new Shipment(
        args.type,
        getContext(context)
      ).getAllManifests();
      if (manifests.errors.length > 0) {
        throw new Error(JSON.stringify(manifests.errors));
      }
      return manifests.data.manifests;
    },
    manifest: async (parent, args, context) => {
      const manifest = await new Shipment(
        args.type,
        getContext(context)
      ).getManifest(args.manifestId);
      if (manifest.errors.length > 0) {
        throw new Error(JSON.stringify(manifest.errors));
      }
      return manifest.data;
    },
    trackings: async (parent, args, context) => {
      const trackings = await new Shipment(
        args.type,
        getContext(context)
      ).getTrackings();
      if (trackings.errors.length > 0) {
        throw new Error(JSON.stringify(trackings.errors));
      }
      return trackings.data.trackings;
    },
    trackingStatus: async (parent, args, context) => {
      const tracking = await new Shipment(
        args.type,
        getContext(context)
      ).getTracking(args.tracking);
      if (tracking.errors.length > 0) {
        throw new Error(JSON.stringify(tracking.errors));
      }
      return tracking.data.tracking;
    },
    shipments: async (parent, args, context) => {
      const shipments = await new Shipment(
        args.type,
        getContext(context)
      ).getShipments();
      if (shipments.errors.length > 0) {
        throw new Error(JSON.stringify(shipments.errors));
      }
      return shipments.data.shipments;
    }
  },
  Mutation: {
    createShipment: async (parent, args, context) => {
      const shipment = await new Shipment(
        args.type,
        getContext(context)
      ).createShipment(args.shipment);
      if (shipment.errors.length > 0) {
        throw new Error(JSON.stringify(shipment.errors));
      }
      return shipment.data.shipment;
    },
    validateAddress: async (parent, args, context) => {
      const address = await new Shipment(
        args.type,
        getContext(context)
      ).validateAddress(args.address);
      if (address.errors.length > 0) {
        throw new Error(JSON.stringify(address.errors));
      }
      return address.data;
    },
    createLabel: async (parent, args, context) => {
      const label = await new Shipment(
        args.type,
        getContext(context)
      ).createLabel(args.label);
      if (label.errors.length > 0) {
        throw new Error(JSON.stringify(label.errors));
      }
      return label.data;
    },
    createManifest: async (parent, args, context) => {
      const manifest = await new Shipment(
        args.type,
        getContext(context)
      ).createManifest(args.manifest);
      if (manifest.errors.length > 0) {
        throw new Error(JSON.stringify(manifest.errors));
      }
      return manifest.data;
    },
    createTracking: async (parent, args, context) => {
      const tracking = await new Shipment(
        args.type,
        getContext(context)
      ).createTracking(args.tracking);
      if (tracking.errors.length > 0) {
        throw new Error(JSON.stringify(tracking.errors));
      }
      return tracking.data.tracking;
    },
    cancelOrDeleteLabel: async (parent, args, context) => {
      const label = await new Shipment(
        args.type,
        getContext(context)
      ).deleteLabel(args.labelId);
      if (label.errors.length > 0) {
        throw new Error(JSON.stringify(label.errors));
      }
      return label.data;
    },
    createAddress: async (parent, args, context) => {
      const address = await new Shipment(
        args.type,
        getContext(context)
      ).createAddress(args.address);
      if (address.errors.length > 0) {
        throw new Error(JSON.stringify(address.errors));
      }
      return address.data.address;
    }
  }
};

export default resolvers;
