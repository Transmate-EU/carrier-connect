import { setEnv } from './setEnv';
import Shipment from '../controller/shipment';

async function main(params) {
    let result
    let statusCode
    let warnings

    setEnv(params);
    
    const { type, request } = params;
    
    try {
        switch (true){
            case type === "rates":
                var rates = await new Shipment().getRates(request.type, request.shipment);
                if (rates.errors.length > 0){
                    statusCode = 500;
                    throw new Error(JSON.stringify(rates.errors));
                }
                result = rates.data.rates
                break
            case type === "labels":
                var labels = await new Shipment().getLabels(request.type);
                if (labels.errors.length > 0){
                    statusCode = 500;
                    throw new Error(JSON.stringify(labels.errors));
                }
                result = labels.data.labels;
                break
            case type === "manifests":
                var manifests = await new Shipment().getAllManifests(request.type);
                if (manifests.errors.length > 0){
                    statusCode = 500;
                    throw new Error(JSON.stringify(manifests.errors));
                }
                result = manifests.data.manifests
                break
            case type === "manifest":
                var manifest = await new Shipment().getManifest(request.type, request.manifestId);
                if (manifest.errors.length > 0){
                    statusCode = 500;
                    throw new Error(JSON.stringify(manifest.errors));
                }
                result = manifest.data
                break
            case type === "trackings":
                var trackings = await new Shipment().getTrackings(request.type);
                if (trackings.errors.length > 0){
                    statusCode = 500;
                    throw new Error(JSON.stringify(trackings.errors));
                }
                result = trackings.data.trackings
                break
            case type === "trackingStatus":
                var tracking = await new Shipment().getTracking(request.type, request.tracking);
                if (tracking.errors.length > 0){
                    statusCode = 500;
                    throw new Error(JSON.stringify(tracking.errors));
                }
                result = tracking.data.tracking
                break
            case type === "shipments":
                var shipments = await new Shipment().getShipments(request.type);
                if (shipments.errors.length > 0){
                    statusCode = 500;
                    throw new Error(JSON.stringify(shipments.errors));
                }
                result = shipments.data.shipments;
                break
            case type === "createShipment":
                var shipment = await new Shipment().createShipment(request.type, request.shipment);
                if (shipment.errors.length > 0){
                    statusCode = 500;
                    throw new Error(JSON.stringify(shipment.errors));
                }
                result = shipment.data.shipment
                break
            case type === "validateAddress":
                var address = await new Shipment().validateAddress(request.type, request.address);
                if (address.errors.length > 0){
                    statusCode = 500;
                    throw new Error(JSON.stringify(address.errors));
                }
                result = address.data
                break
            case type === "createLabel":
                var label = await new Shipment().createLabel(request.type, request.label);
                if (label.errors.length > 0){
                    statusCode = 500;
                    throw new Error(JSON.stringify(label.errors));
                }
                result = label.data
                break
            case type === "createManifest":
                var manifest = await new Shipment().createManifest(request.type, request.manifest);
                if (manifest.errors.length > 0){
                    statusCode = 500;
                    throw new Error(JSON.stringify(manifest.errors));
                }
                result = manifest.data
                break
            case type === "createTracking":
                var tracking = await new Shipment().createTracking(request.type, request.tracking);
                if (tracking.errors.length > 0){
                    statusCode = 500;
                    throw new Error(JSON.stringify(tracking.errors));
                }
                result = tracking.data.tracking;
                break
            case type === "cancelOrDeleteLabel":
                var label = await new Shipment().deleteLabel(request.type, request.labelId);
                if (label.errors.length > 0){
                    statusCode = 500;
                    throw new Error(JSON.stringify(label.errors));
                }
                result = label.data;
                break
            case type === "createAddress":
                var address = await new Shipment().createAddress(request.type, request.address);
                if (address.errors.length > 0){
                    statusCode = 500;
                    throw new Error(JSON.stringify(address.errors));
                }
                result = address.data.address
                break
            default:
                statusCode = 500;
                throw new Error("Unknown type used");
        }
    } catch (error){
        return {
            body: {
                error: {
                    code: 'issue with function!',
                    message: error.message,
                    request: request,
                    type,
                }
            },
            statusCode,
            headers: { "Content-Type": "application/json" }
        }
    }

    return {
        body: {
            result,
            warnings    
        },
        statusCode: 200,
        headers: { "Content-Type": "application/json" }
    }
}

global.main = main;

exports.main = main;