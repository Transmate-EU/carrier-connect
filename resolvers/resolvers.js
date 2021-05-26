import Shipment from "../controller/shipment";
// import users from "../data/users";
const get = require('lodash.get');
const debug = require("debug")("resolver");
const resolvers = {
    Query: {
        ratings: async (parent, args) => {
            const rates = await Shipment.getRates(args.type, args.shipment);
            if (get(rates, "errors.length") > 0){
                throw new Error(JSON.stringify(rates.errors));
            }
            return rates.data.rates
        },
        labels: async (parent, args) => {
            const labels = await Shipment.getLabels(args.type);
            if (get(labels, "errors.length") > 0){
                throw new Error(JSON.stringify(labels.errors));
            }
            return labels.data.labels
        },
        manifests: async(parent, args) => {
            const manifests = await Shipment.getAllManifests(args.type);
            if (get(manifests, "errors.length") > 0){
                throw new Error(JSON.stringify(manifests.errors));
            }
            return manifests.data.manifests
        },    
        manifest: async (parent, args) => {
            const manifest = await Shipment.getManifest(args.type, args.manifestId);
            if (get(manifest, "errors.length") > 0){
                throw new Error(JSON.stringify(manifest.errors));
            }
            return manifest.data
        },
        trackings: async (parent, args) => {
            const trackings = await Shipment.getTrackings(args.type);
            if (get(trackings,"errors.length") > 0){
                throw new Error(JSON.stringify(trackings.errors));
            }
            return trackings.data.trackings
        },
        trackingStatus: async (parent, args) => {
            const tracking = await Shipment.getTracking(args.type, args.tracking);
            if (get(tracking,"errors.length") > 0){
                throw new Error(JSON.stringify(tracking.errors));
            }
            return tracking.data.tracking
        },
        shipments: async (parent, args) => {
            debug("parent %o , get shipments for args %o", parent, args);
            const shipments = await Shipment.getShipments(args.type);
            if (get(shipments, "errors.length") > 0){
                debug("errors found ", shipments.errors);
                throw new Error(JSON.stringify(shipments.errors));
            }
            debug("result %o ", shipments);
            return get(shipments,"data.shipments",[]);
        }
    },
    Mutation: {
        createShipment: async (parent, args) => {
            const shipment = await Shipment.createShipment(args.type, args.shipment);
            if (get(shipment, "errors.length") > 0){
                throw new Error(JSON.stringify(shipment.errors));
            }
            return shipment.data.shipment
        },
        validateAddress: async (parent, args) => {
            const address = await Shipment.validateAddress(args.type, args.address);
            if (get(address, "errors.length") > 0){
                throw new Error(JSON.stringify(address.errors));
            }
            return address.data
        },
        createLabel: async (parent, args) => {
            const label = await Shipment.createLabel(args.type, args.label);
            if (get(label, "errors.length") > 0){
                throw new Error(JSON.stringify(label.errors));
            }
            return label.data
        },
        createManifest: async(parent, args) => {
            const manifest = await Shipment.createManifest(args.type, args.manifest);
            if (get(manifest, "errors.length")> 0){
                throw new Error(JSON.stringify(manifest.errors));
            }
            return manifest.data
        },
        createTracking: async(parent, args) => {
            const tracking = await Shipment.createTracking(args.type, args.tracking);
            if (get(tracking,"errors.length") > 0){
                throw new Error(JSON.stringify(tracking.errors));
            }
            return tracking.data.tracking;
        },
        cancelOrDeleteLabel: async (parent, args) => {
            const label = await Shipment.deleteLabel(args.type, args.labelId);
            if (get(label, "errors.length") > 0){
                throw new Error(JSON.stringify(label.errors));
            }
            return label.data;
        },
        createAddress: async (parent, args) => {
            const address = await Shipment.createAddress(args.type, args.address);
            if (get(address, "errors.length") > 0){
                throw new Error(JSON.stringify(address.errors));
            }
            return address.data.address
        }
    }
}

export default resolvers;
