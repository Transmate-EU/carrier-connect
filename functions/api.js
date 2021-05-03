async function main(params) {
    let result
    let statusCode
    let warnings
    
    const { type, requestBody } = params;
    
    try {
        switch (type.toLowerCase()){
            case "ratings":
                const rates = await Shipment.getRates(requestBody.type, requestBody.shipment);
                if (rates.errors.length > 0){
                    statusCode = 500;
                    throw new Error(JSON.stringify(rates.errors));
                }
                result = rates.data.rates
            case "labels":
                const labels = await Shipment.getLabels(requestBody.type);
                if (labels.errors.length > 0){
                    statusCode = 500;
                    throw new Error(JSON.stringify(labels.errors));
                }
                result = labels.data.labels
            case "manifests":
                const manifests = await Shipment.getAllManifests(requestBody.type);
                if (manifests.errors.length > 0){
                    statusCode = 500;
                    throw new Error(JSON.stringify(manifests.errors));
                }
                result = manifests.data.manifests
            case "manifest":
                const manifest = await Shipment.getManifest(requestBody.type, requestBody.manifestId);
                if (manifest.errors.length > 0){
                    statusCode = 500;
                    throw new Error(JSON.stringify(manifest.errors));
                }
                result = manifest.data
            case "trackings":
                const trackings = await Shipment.getTrackings(requestBody.type);
                if (trackings.errors.length > 0){
                    statusCode = 500;
                    throw new Error(JSON.stringify(trackings.errors));
                }
                result = trackings.data.trackings
            case "trackingStatus":
                const tracking = await Shipment.getTracking(requestBody.type, requestBody.tracking);
                if (tracking.errors.length > 0){
                    statusCode = 500;
                    throw new Error(JSON.stringify(tracking.errors));
                }
                result = tracking.data.tracking
            case "shipments":
                const shipments = await Shipment.getShipments(requestBody.type);
                if (shipments.errors.length > 0){
                    statusCode = 500;
                    throw new Error(JSON.stringify(shipments.errors));
                }
                result = shipments.data.shipments;
            case "createShipment":
                const shipment = await Shipment.createShipment(requestBody.type, requestBody.shipment);
                if (shipment.errors.length > 0){
                    statusCode = 500;
                    throw new Error(JSON.stringify(shipment.errors));
                }
                result = shipment.data.shipment
            case "validateAddress":
                const address = await Shipment.validateAddress(requestBody.type, requestBody.address);
                if (address.errors.length > 0){
                    statusCode = 500;
                    throw new Error(JSON.stringify(address.errors));
                }
                result = address.data
            case "createLabel":
                const label = await Shipment.createLabel(requestBody.type, requestBody.label);
                if (label.errors.length > 0){
                    statusCode = 500;
                    throw new Error(JSON.stringify(label.errors));
                }
                result = label.data
            case "createManifest":
                const manifest = await Shipment.createManifest(requestBody.type, requestBody.manifest);
                if (manifest.errors.length > 0){
                    statusCode = 500;
                    throw new Error(JSON.stringify(manifest.errors));
                }
                result = manifest.data
            case "createTracking":
                const tracking = await Shipment.createTracking(requestBody.type, requestBody.tracking);
                if (tracking.errors.length > 0){
                    statusCode = 500;
                    throw new Error(JSON.stringify(tracking.errors));
                }
                result = tracking.data.tracking;
            case "cancelOrDeleteLabel":
                const label = await Shipment.deleteLabel(requestBody.type, requestBody.labelId);
                if (label.errors.length > 0){
                    statusCode = 500;
                    throw new Error(JSON.stringify(label.errors));
                }
                result = label.data;
            case "createAddress":
                const address = await Shipment.createAddress(requestBody.type, requestBody.address);
                if (address.errors.length > 0){
                    statusCode = 500;
                    throw new Error(JSON.stringify(address.errors));
                }
                result = address.data.address
        }
    } catch (error){
        return {
            body: {
                error: {
                    code: 'issue with function!',
                    message: error.message,
                    request: requestBody,
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

exports.main