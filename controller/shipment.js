import axios from "axios";
import dotenv from 'dotenv';
import { 
    shippo,
    postmentCredentialHeaders,
    shippoCredentialHeaders,
    postmenURL,
    afterShipHeaders
} from "../helpers/apiAdapter";
import { 
    postmenAddressReqSchema,
    postmenCalculateSchema,
    postmenCreateLabelSchema,
    postmenCreateShipperAccount,
    postmenGetTrackingSchema,
    postmenManifestReqSchema,
    validateSchema,
    shippoCreateShipmentSchema,
    shippoCarrierAccountSchema,
    shippoCreateManifestSchema,
    shippoAddressCreationSchema,
    shippoCreateLabelSchema
} from "../schemas/schemas";

dotenv.config();

class Shipment {
    static async createShipment(service, requestObject) {
        /* 
            To create shippo shipment, we need to provide a body
            with the following properties(address_from, address_to,
            parcels)
        */
        try {    
            if (service === 'shippo'){
                const resultObject = await shippo.shipment.create(requestObject);

                const errors = validateSchema(requestObject, shippoCreateShipmentSchema);
                
                if (errors){
                    return {
                        data: {},
                        warnings: [],
                        errors: errors
                    }
                }

                return {
                    data: resultObject,
                    warnings: [],
                    errors: []
                };
            }   
        } catch (error) {
            if (error.response){
                return {
                    data: {},
                    warnings: [],
                    errors: error.response.data
                }
            }

            return { 
                data: {},
                warnings: [],
                errors: error.message
            }
        }
    }

    static async createCarrierAccount(service, requestObject) {
        try {    
            if (service === 'shippo'){
                const errors = validateSchema(requestObject,  shippoCarrierAccountSchema);
                
                if (errors){
                    return {
                        data: {},
                        warnings: [],
                        errors: errors
                    }
                }

                const resultObject = await shippo.carrieraccount.create(requestObject);
                return {
                    data: resultObject,
                    warnings: [],
                    errors: []
                };
            }   

            if (service === 'postmen'){
                const errors = validateSchema(requestObject, postmenCreateShipperAccount);
                
                if (errors){
                    return {
                        data: {},
                        warnings: [],
                        errors: errors
                    }
                }

                const data = await axios({ 
                    method: 'post',
                    url: `${postmenURL}/shipper-accounts`,
                    data: requestObject,
                    headers: { 
                        ...postmentCredentialHeaders.headers
                    }
                });
                return {
                    data: data.data,
                    warnings: [],
                    errors: []
                };
            }
        } catch (error) {
            if (error.response){
                return {
                    data: {},
                    warnings: [],
                    errors: [error.response.data]
                }
            }

            return { 
                data: {},
                warnings: [],
                errors: [error.message]
            }
        }
    }

    static async createManifest(service, manifest) {
        try {    
            if (service === 'shippo'){
                const errors = validateSchema(requestObject, shippoCreateManifestSchema);
                
                if (errors){
                    return {
                        data: {},
                        warnings: [],
                        errors: errors
                    }
                }

                const resultObject = await shippo.manifest.create(manifest);
                return {
                    data: resultObject,
                    warnings: [],
                    errors: []
                };
            }   

            if (service === 'postmen'){
                const errors = validateSchema(manifest, postmenManifestReqSchema);
                
                if (errors){
                    return {
                        data: {},
                        warnings: [],
                        errors: errors
                    }
                }

                const data = await axios({ 
                    method: 'post',
                    url: `${postmenURL}/manifests`,
                    data: manifest,
                    headers: { 
                        ...postmentCredentialHeaders.headers
                    }
                });
                return {
                    data: data.data,
                    warnings: [],
                    errors: []
                };
            }
        } catch (error) {
            if (error.response){
                return {
                    errors: [error.response.data]
                }
            }

            return { 
                data: {},
                warnings: [],
                errors: [error.message]
            }
        }
    }


    static async getRates(service, shipment) {
        /* 
            To get shippo rates, we need to first create a shipment see #createShipment
            then we supply a shipment id.
            As for Postmen, we need to supply a body that has(shipper acc, shipment(parcels, 
                ship_from and ship_to)) as seen in the tests.
            a shipper account(can be created) using #createCarrierAccount(postment, requestBody).
        */
        try {    
            if (service === 'shippo'){
                const resultObject = await shippo.shipment.rates(shipment);
                return {
                    data: resultObject,
                    warnings: [],
                    errors: []
                };
            }   

            if (service === 'postmen'){
                const errors = validateSchema(shipment, postmenCalculateSchema);
                
                if (errors){
                    return {
                        data: {},
                        warnings: [],
                        errors: errors
                    }
                }

                const data = await axios({ 
                    method: 'post',
                    url: `${postmenURL}/rates`,
                    data: shipment,
                    headers: { 
                        ...postmentCredentialHeaders.headers
                    }
                });
                return {
                    data: data.data.data,
                    warnings: [],
                    errors: []
                };
            }
        } catch (error) {
            if (error.response){
                return {
                    data: {},
                    warnings: [],
                    errors: [error.response.data]
                }
            }

            return { 
                data: {},
                warnings: [],
                errors: [error.message]
            }
        }
    }

    static async createAddress(service, address) {
        try {    
            if (service === 'shippo'){
                const errors = validateSchema(address, shippoAddressCreationSchema);
                
                if (errors){
                    return {
                        data: {},
                        warnings: [],
                        errors: errors
                    }
                }

                const resultObject = await shippo.address.create(address);
                return {
                    data: resultObject,
                    warnings: [],
                    errors: []
                };
            } 
        } catch (error) {
            if (error.response){
                return {
                    data: {},
                    warnings: [],
                    errors: [error.response.data]
                }
            }

            return { 
                data: {},
                warnings: [],
                errors: [error.message]
            }
        }
    }
    
    static async validateAddress(service, address) {
        /* 
            To validate shippo address, we need to first create the address and 
            then verify it and as for postmen, we just provide an address body that has
            {contact_name, street1, city, state, postal_code, country, type, phone, email }
            see this test in the test files
        */
        try {    
            if (service === 'shippo'){
                const resultObject = await shippo.address.validate(address);
                return {
                    data: resultObject,
                    warnings: [],
                    errors: []
                };
            } 

            if (service === 'postmen'){
                const errors = validateSchema(address, postmenAddressReqSchema);
                
                if (errors){
                    return {
                        data: {},
                        warnings: [],
                        errors: errors
                    }
                }

                const data = await axios({ 
                    method: 'post',
                    url: `${postmenURL}/address-validations`,
                    data: address,
                    headers: { 
                        ...postmentCredentialHeaders.headers
                    }
                });
                return {
                    data: data.data,
                    warnings: [],
                    errors: []
                };
            }
        } catch (error) {
            if (error.response){
                return {
                    data: {},
                    warnings: [],
                    errors: [error.response.data]
                }
            }

            return { 
                data: {},
                warnings: [],
                errors: [error.message]
            }
        }
    }

    static async createLabel(service, label) {
        try {    
            if (service === 'shippo'){
                const errors = validateSchema(label, shippoCreateLabelSchema);
                
                if (errors){
                    return {
                        data: {},
                        warnings: [],
                        errors: errors
                    }
                }

                const resultObject = await shippo.transaction.create(label);
                return {
                    data: resultObject,
                    warnings: [],
                    errors: []
                };
            }   

            if (service === 'postmen'){
                const errors = validateSchema(label, postmenCreateLabelSchema);
                
                if (errors){
                    return {
                        data: {},
                        warnings: [],
                        errors: errors
                    }
                }
                const data = await axios({ 
                    method: 'post',
                    url: `${postmenURL}/labels`,
                    data: label,
                    headers: { 
                        ...postmentCredentialHeaders.headers
                    }
                });
                return {
                    data: data.data.data,
                    warnings: [],
                    errors: []
                };
            }
        } catch (error) {
            if (error.response){
                return {
                    data: {},
                    warnings: [],
                    errors: [error.response.data]
                }
            }

            return { 
                data: {},
                warnings: [],
                errors: [error.message]
            }
        }
    }

    static async getLabels(service) {
        /* 
            To get shippo and postmen labels, we need to first create a lable using the label method,
            of this class.
        */
        try {
            if (service === 'shippo'){
                const resultObject = await shippo.transaction.list();
                return {
                    data: resultObject,
                    warnings: [],
                    errors: []
                };
            }

            if (service === 'postmen'){
                const data = await axios.get(`${postmenURL}/labels`, postmentCredentialHeaders);
                return {
                    data: data.data.data,
                    warnings: [],
                    errors: []
                };
            }
        } catch (error) {
            if (error.response){
                return {
                    data: {},
                    warnings: [],
                    errors: [error.response.data]
                }
            }

            return { 
                data: {},
                warnings: [],
                errors: [error.message]
            }
        }
    }

    static async getAllManifests(service) {
        /* 
            To get shippo manifests, we need to first create the manifest using
           the createManifest method of this class and as for postmen, we also
           do the same as querying would always return an empty array if none 
           is found
        */
        try {    
            if (service === 'shippo'){
                const data = await axios({ 
                    method: 'get',
                    url: `${process.env.SHIPPO_URL}/manifests`,
                    headers: { 
                        ...shippoCredentialHeaders.headers
                    }
                });
                return {
                    data: data.data,
                    warnings: [],
                    errors: []
                };
            }   

            if (service === 'postmen'){
                const data = await axios({ 
                    method: 'get',
                    url: `${postmenURL}/manifests`,
                    headers: { 
                        ...postmentCredentialHeaders.headers
                    }
                });
                return {
                    data: data.data,
                    warnings: [],
                    errors: []
                };
            }
        } catch (error) {
            if (error.response){
                return {
                    errors: [error.response.data]
                }
            }

            return { 
                data: {},
                warnings: [],
                errors: [error.message]
            }
        }
    }

    static async getManifest(service, manifest) {
        /* 
            To get shippo/postmen manifest, we need to provide a manifest id,
            manifests can be created using the method createManifest,
            see tests for body definition
        */
        try {    
            if (service === 'shippo'){
                const resultObject = await shippo.manifest.retrieve(manifest);
                return {
                    data: resultObject,
                    warnings: [],
                    errors: []
                };
            }   

            if (service === 'postmen'){
                const data = await axios.get(`${postmenURL}/manifests/${manifest}`, postmentCredentialHeaders);
                return {
                    data: data.data,
                    warnings: [],
                    errors: []
                };
            }
        } catch (error) {
            if (error.response){
                return {
                    data: {},
                    warnings: [],
                    errors: [error.response.data]
                }
            }

            return { 
                data: {},
                warnings: [],
                errors: [error.message]
            }
        }
    }

    static async createTracking(service, requestObj){
        /* 
            To create a tracking, we need to provide a body with the 
            following properties
        */
        try {
            if (service === 'postmen'){
                const data = await axios({ 
                    method: 'post',
                    url: `${process.env.AFTER_SHIP_URL}/trackings`,
                    data: requestObj,
                    headers: { 
                        ...afterShipHeaders.headers
                    }
                });
                return {
                    data: data.data.data,
                    warnings: [],
                    errors: []
                };
            }
        } catch (error){
            if (error.response){
                return {
                    data: {},
                    warnings: [],
                    errors: [error.response.data]
                }
            }

            return { 
                data: {},
                warnings: [],
                errors: [error.message]
            }
        }
    }

    static async getTrackings(service) {
        try {
            if (service === 'postmen'){
                const data = await axios.get(`${process.env.AFTER_SHIP_URL}/trackings`, afterShipHeaders);
                return {
                    data: data.data.data,
                    warnings: [],
                    errors: []
                };
            }
        } catch (error){
            if (error.response){
                return {
                    data: {},
                    warnings: [],
                    errors: [error.response.data]
                }
            }

            return { 
                data: {},
                warnings: [],
                errors: [error.message]
            }
        }
    }

    static async getTracking(service, tracking) {
        /* 
            To get shippo tracking status, we need to provide a tracking carrier and number and 
            as for postmen we need to provide a slug(courier e.g fedex) and an id,
            tracking can be create using the createTracking method
        */
        try {    
            if (service === 'shippo'){
                const data = await axios.get(`${process.env.SHIPPO_URL}/tracks/${tracking.carrier}/${tracking.trackingNumber}`, shippoCredentialHeaders);
                return {
                    data: data.data,
                    warnings: [],
                    errors: []
                };
            }
            
            if (service === 'postmen') {
                const errors = validateSchema(tracking, postmenGetTrackingSchema);
                
                if (errors){
                    return {
                        data: {},
                        warnings: [],
                        errors: errors
                    }
                }
                
                const data = await axios.get(`${process.env.AFTER_SHIP_URL}/trackings/${tracking.trackingSlug}/${tracking.trackingId}`, afterShipHeaders);
                return {
                    data: data.data,
                    warnings: [],
                    errors: []
                };
            }
        } catch (error) {
            if (error.response){
                return {
                    data: {},
                    warnings: [],
                    errors: [error.response.data]
                }
            }

            return { 
                data: {},
                warnings: [],
                errors: [error.message]
            }
        }
    }

    static async deleteLabel(service, label) {
        /* 
            To cancel postmen label, we need to provide the label id
            this can be got using getLabels
        */
        try {    
            if (service === 'postmen'){
                const data = await axios({ 
                    method: 'post',
                    url: `${postmenURL}/cancel-labels`,
                    data: { 
                        label: { id: label }, 
                        async: false
                    },
                    headers: { ...postmentCredentialHeaders.headers }
                });

                return {
                    data: data.data,
                    warnings: [],
                    errors: []
                };
            }   
        } catch (error) {
            if (error.response){
                return {
                    data: {},
                    warnings: [],
                    errors: [error.response.data]
                }
            }

            return { 
                data: {},
                warnings: [],
                errors: [error.message]
            }
        }
    }
}   

export default Shipment;