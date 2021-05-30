import Shipment from "../controller/shipment";
import { setEnv } from '../functions/setEnv';

const resolvers = {
    Query: {
        rates: async (parent, args, context) => {
            if (typeof(context) === 'function'){
                
                context();
            }

            if (typeof(context) === 'object'){
                setEnv(context);
            }

            const rates = await new Shipment().getRates(args.type, args.shipment);
            if (rates.errors.length > 0){
                throw new Error(JSON.stringify(rates.errors));
            }
            return rates.data.rates
        },
        labels: async (parent, args, context) => {
            if (typeof(context) === 'function'){
                context();
            }

            if (typeof(context) === 'object'){
                setEnv(context);
            }

            const labels = await new Shipment().getLabels(args.type)
            if (labels.errors.length > 0){
                throw new Error(JSON.stringify(labels.errors));
            }
            return labels.data.labels
        },
        manifests: async(parent, args, context) => {
            if (typeof(context) === 'function'){
                
                context();
            }

            if (typeof(context) === 'object'){
                setEnv(context);
            }

            const manifests = await new Shipment().getAllManifests(args.type);
            if (manifests.errors.length > 0){
                throw new Error(JSON.stringify(manifests.errors));
            }
            return manifests.data.manifests
        },    
        manifest: async (parent, args, context) => {
            if (typeof(context) === 'function'){
                
                context();
            }

            if (typeof(context) === 'object'){
                setEnv(context);
            }

            const manifest = await new Shipment().getManifest(args.type, args.manifestId);
            if (manifest.errors.length > 0){
                throw new Error(JSON.stringify(manifest.errors));
            }
            return manifest.data
        },
        trackings: async (parent, args, context) => {
            if (typeof(context) === 'function'){
                
                context();
            }

            if (typeof(context) === 'object'){
                setEnv(context);
            }

            const trackings = await new Shipment().getTrackings(args.type);
            if (trackings.errors.length > 0){
                throw new Error(JSON.stringify(trackings.errors));
            }
            return trackings.data.trackings
        },
        trackingStatus: async (parent, args, context) => {
            if (typeof(context) === 'function'){
                
                context();
            }

            if (typeof(context) === 'object'){
                setEnv(context);
            }

            const tracking = await new Shipment().getTracking(args.type, args.tracking);
            if (tracking.errors.length > 0){
                throw new Error(JSON.stringify(tracking.errors));
            }
            return tracking.data.tracking
        },
        shipments: async (parent, args, context) => {
            if (typeof(context) === 'function'){
                
                context();
            }

            if (typeof(context) === 'object'){
                setEnv(context);
            }

            const shipments = await new Shipment().getShipments(args.type);
            if (shipments.errors.length > 0){
                throw new Error(JSON.stringify(shipments.errors));
            }
            return shipments.data.shipments;
        }
    },
    Mutation: {
        createShipment: async (parent, args, context) => {
            if (typeof(context) === 'function'){
                
                context();
            }

            if (typeof(context) === 'object'){
                setEnv(context);
            }

            const shipment = await new Shipment().createShipment(args.type, args.shipment);
            if (shipment.errors.length > 0){
                throw new Error(JSON.stringify(shipment.errors));
            }
            return shipment.data.shipment
        },
        validateAddress: async (parent, args, context) => {
            if (typeof(context) === 'function'){
                
                context();
            }

            if (typeof(context) === 'object'){
                setEnv(context);
            }

            const address = await new Shipment().validateAddress(args.type, args.address);
            if (address.errors.length > 0){
                throw new Error(JSON.stringify(address.errors));
            }
            return address.data
        },
        createLabel: async (parent, args, context) => {
            if (typeof(context) === 'function'){
                
                context();
            }

            if (typeof(context) === 'object'){
                setEnv(context);
            }

            const label = await new Shipment().createLabel(args.type, args.label);
            if (label.errors.length > 0){
                throw new Error(JSON.stringify(label.errors));
            }
            return label.data
        },
        createManifest: async(parent, args, context) => {
            if (typeof(context) === 'function'){
                
                context();
            }

            if (typeof(context) === 'object'){
                setEnv(context);
            }

            const manifest = await new Shipment().createManifest(args.type, args.manifest);
            if (manifest.errors.length > 0){
                throw new Error(JSON.stringify(manifest.errors));
            }
            return manifest.data
        },
        createTracking: async(parent, args, context) => {
            if (typeof(context) === 'function'){
                
                context();
            }

            if (typeof(context) === 'object'){
                setEnv(context);
            }

            const tracking = await new Shipment().createTracking(args.type, args.tracking);
            if (tracking.errors.length > 0){
                throw new Error(JSON.stringify(tracking.errors));
            }
            return tracking.data.tracking;
        },
        cancelOrDeleteLabel: async (parent, args, context) => {
            if (typeof(context) === 'function'){
                
                context();
            }

            if (typeof(context) === 'object'){
                setEnv(context);
            }

            const label = await new Shipment().deleteLabel(args.type, args.labelId);
            if (label.errors.length > 0){
                throw new Error(JSON.stringify(label.errors));
            }
            return label.data;
        },
        createAddress: async (parent, args, context) => {
            if (typeof(context) === 'function'){
                
                context();
            }

            if (typeof(context) === 'object'){
                setEnv(context);
            }

            const address = await new Shipment().createAddress(args.type, args.address);
            if (address.errors.length > 0){
                throw new Error(JSON.stringify(address.errors));
            }
            return address.data.address
        }
    }
}

export default resolvers;
