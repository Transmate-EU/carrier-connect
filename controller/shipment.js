import axios from "axios";
import dotenv from 'dotenv';
import { 
    shippo,
    postmentCredentialHeaders,
    shippoCredentialHeaders,
    postmenURL,
    afterShipHeaders
} from "../helpers/apiAdapter";

dotenv.config();

class Shipment {
    static async createShipment(service, requestObject) {
        try {    
            if (service === 'shippo'){
                const resultObject = await shippo.shipment.create(requestObject);
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
                const resultObject = await shippo.carrieraccount.create(requestObject);
                return {
                    data: resultObject,
                    warnings: [],
                    errors: []
                };
            }   

            if (service === 'postmen'){
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
                const resultObject = await shippo.manifest.create(manifest);
                return {
                    data: resultObject,
                    warnings: [],
                    errors: []
                };
            }   

            if (service === 'postmen'){
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
                const data = await axios.get(`${postmenURL}/rates`, postmentCredentialHeaders);
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
                console.log("shippo", shippo);
                const resultObject = await shippo.transaction.create(label);
                return {
                    data: resultObject,
                    warnings: [],
                    errors: []
                };
            }   

            if (service === 'postmen'){
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