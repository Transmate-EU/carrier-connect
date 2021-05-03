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
                const formatedObject = {
                    parcels: requestObject.parcels.map((parcel) => {     
                        return { 
                            width: parcel.width,
                            length: parcel.length,
                            height: parcel.height,
                            mass_unit: parcel.massUnit,
                            distance_unit: parcel.distanceUnit,
                            weight: parcel.weight.value.toString(),     
                        }    
                    }),
                    address_from: {
                        contact_name: requestObject.shipFrom.contactName,
                        street1: requestObject.shipFrom.street1,
                        city: requestObject.shipFrom.city,
                        state: requestObject.shipFrom.state,
                        zip: requestObject.shipFrom.zip,
                        country: requestObject.shipFrom.country,
                        phone: requestObject.shipFrom.phone,
                        email: requestObject.shipFrom.email,
                        company_name: requestObject.shipFrom.companyName,
                    },
                    address_to: {
                        contact_name: requestObject.shipTo.contactName,
                        street1: requestObject.shipTo.street1,
                        city: requestObject.shipTo.city,
                        state: requestObject.shipTo.state,
                        zip: requestObject.shipTo.zip,
                        country: requestObject.shipTo.country,
                        phone: requestObject.shipTo.phone,
                        email: requestObject.shipTo.email,
                        company_name: requestObject.shipFrom.companyName,
                    }
                }
                
                const errors = validateSchema(formatedObject, shippoCreateShipmentSchema);

                 if (errors){
                    return {
                        data: {},
                        warnings: [],
                        errors: errors
                    }
                }

                const shipment = await shippo.shipment.create(formatedObject);

                return {
                    data: {
                        shipment: {
                            id: shipment.object_id,
                            createdAt: shipment.object_created,
                            updatedAt: shipment.object_updated,
                            objectOwner: shipment.object_owner,
                            shipFrom: {
                                id: shipment.address_from.object_id,
                                isComplete: shipment.address_from.is_complete,
                                contactName: shipment.address_from.name,
                                street1: shipment.address_from.street1,
                                city: shipment.address_from.city,
                                state: shipment.address_from.state,
                                zip: shipment.address_from.zip,
                                country: shipment.address_from.country,
                                phone: shipment.address_from.phone,
                                email: shipment.address_from.email,
                                validationResults: shipment.address_from.validation_results
                            },
                            shipTo: {
                                id: shipment.address_to.object_id,
                                isComplete: shipment.address_to.is_complete,
                                contactName: shipment.address_to.name,
                                street1: shipment.address_to.street1,
                                city: shipment.address_to.city,
                                state: shipment.address_to.state,
                                zip: shipment.address_to.zip,
                                country: shipment.address_to.country,
                                phone: shipment.address_to.phone,
                                email: shipment.address_to.email,
                                validationResults: shipment.address_to.validation_results
                            },
                            addressReturn: {
                                id: shipment.address_return.object_id,
                                isComplete: shipment.address_return.is_complete,
                                contactName: shipment.address_return.name,
                                street1: shipment.address_return.street1,
                                city: shipment.address_return.city,
                                state: shipment.address_return.state,
                                zip: shipment.address_return.zip,
                                country: shipment.address_return.country,
                                phone: shipment.address_return.phone,
                                email: shipment.address_return.email,
                                validationResults: shipment.address_return.validation_results
                            },
                            status: shipment.status,
                            parcels: shipment.parcels.map((parcel) => {
                                return {
                                    id: parcel.object_id,
                                    length: parcel.length,
                                    width: parcel.width,
                                    height: parcel.height,
                                    distanceUnit: parcel.distance_unit,
                                    weight: {
                                        value: parcel.weight,
                                        unit: parcel.mass_unit
                                    }
                                }
                            }),
                            rates: shipment.rates.map((rate) => {
                                return {
                                    id: rate.object_id,
                                    status: rate.status,
                                    serviceType: rate.provider,
                                    serviceName: rate.servicelevel.name,
                                    serviceToken: rate.servicelevel.token,
                                    shipperAccount: {
                                        id: rate.carrier_account
                                    },
                                    createdAt: rate.object_created,
                                    totalCharge: {
                                        amount: rate.amount,
                                        currency: rate.currency
                                    },
                                    localTotalCharge: {
                                        amountLocal: rate.amount_local,
                                        currencyLocal: rate.currency_local
                                    },
                                    durationTerms: rate.duration_terms,
                                    updatedAt: rate.object_updated,
                                }
                            })
                        }
                    },
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
                const formatedManifest = {
                    shipment_date: manifest.shipmentDate,
                    transactions: manifest.transactions,
                    carrier_account: manifest.shipperAccount.id,
                    address_from: manifest.shipFromId
                }

                const errors = validateSchema(formatedManifest, shippoCreateManifestSchema);
                
                if (errors){
                    return {
                        data: {},
                        warnings: [],
                        errors: errors
                    }
                }

                const resultObject = await shippo.manifest.create(formatedManifest);

                return {
                    data: {
                        status: resultObject.status,
                        objectOwner: resultObject.object_owner,
                        createdAt: resultObject.object_created,
                        updatedAt: resultObject.object_updated,
                        shipFromId: resultObject.address_from,
                        shipperAccount: {
                            id: resultObject.carrier_account
                        },
                        transactions: resultObject.transactions
                    },
                    warnings: [],
                    errors: []
                };
            }   

            if (service === 'postmen'){
                const formatedManifest = {
                    shipper_account: {
                        ...manifest.shipperAccount
                    }
                }

                const errors = validateSchema(formatedManifest, postmenManifestReqSchema);
                
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
                    data: formatedManifest,
                    headers: { 
                        ...postmentCredentialHeaders.headers
                    }
                });

                if (data.data.meta.code === 4104){
                    return {
                        data: {},
                        warnings: [],
                        errors: [...data.data.meta.details]
                    }
                }


                return {
                    data: {
                        id: data.data.data.id,
                        status: data.data.data.status,
                        labels: data.data.data.labels,
                        files: {
                            label: data.data.data?.files?.label,
                            invoice: data.data.data?.files?.invoice,
                            customsDeclaration: data.data.data?.files?.customs_declaration,
                            manifest: {
                                paperSize: data.data.data?.files?.manifest?.paper_size,
                                url:  data.data.data?.files?.manifest?.url,
                                fileType: data.data.data?.files?.manifest?.file_type
                            }
                        },  
                        updatedAt: data.data.data.updated_at,
                        createdAt: data.data.data.created_at
                    },
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
                if (!shipment.shipmentId || shipment.shipmentId === "") {
                    return {
                        data: {},
                        warnings: [],
                        errors: ['Please provide shipment id']
                    }
                }

                const resultObject = await shippo.shipment.rates(shipment.shipmentId);
                return {
                    data: { 
                        rates: resultObject.results.map((rate) => {
                            return {
                                id: rate.object_id,
                                status: rate.status,
                                serviceType: rate.provider,
                                serviceToken: rate.servicelevel.token,
                                serviceName: rate.servicelevel.name,
                                shipperAccount: {
                                    id: rate.carrier_account
                                },
                                createdAt: rate.object_created,
                                totalCharge: {
                                    amount: rate.amount,
                                    currency: rate.currency
                                },
                                localTotalCharge: {
                                    amountLocal: rate.amount_local,
                                    currencyLocal: rate.currency_local
                                },
                                durationTerms: rate.duration_terms,
                                updatedAt: rate.object_updated
                            }
                        }),
                    },
                    warnings: [],
                    errors: []
                };
            }   

            if (service === 'postmen'){
                const formatedShipment = {
                    is_document: shipment.isDocument,
                    shipment: {
                        ship_from: {
                            contact_name: shipment.shipment.shipFrom.contactName,
                            street1: shipment.shipment.shipFrom.street1,
                            city: shipment.shipment.shipFrom.city,
                            state: shipment.shipment.shipFrom.state,
                            country: shipment.shipment.shipFrom.country,
                            phone: shipment.shipment.shipFrom.phone,
                            email: shipment.shipment.shipFrom.email,
                            postal_code: shipment.shipment.shipFrom.postalCode
                        },
                        ship_to: {
                            contact_name: shipment.shipment.shipTo.contactName,
                            street1: shipment.shipment.shipTo.street1,
                            city: shipment.shipment.shipTo.city,
                            state: shipment.shipment.shipTo.state,
                            country: shipment.shipment.shipTo.country,
                            phone: shipment.shipment.shipTo.phone,
                            email: shipment.shipment.shipTo.email,
                            postal_code: shipment.shipment.shipTo.postalCode
                        },
                        parcels: shipment.shipment.parcels.map((parcel) => {
                            return {
                                box_type: parcel.boxType,
                                description: parcel.description,
                                weight: parcel.weight,
                                dimension: parcel.dimension,
                                items: parcel.items.map((item) => {
                                    return {
                                        description: item.description,
                                        origin_country: item.originCountry,
                                        quantity: item.quantity,
                                        price: item.price,
                                        weight: item.weight,
                                        sku: item.sku
                                    }
                                })
                            }
                        }),
                    },
                    shipper_accounts: shipment.shipperAccounts
                }

                const errors = validateSchema(formatedShipment, postmenCalculateSchema);
                
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
                    data: formatedShipment,
                    headers: { 
                        ...postmentCredentialHeaders.headers
                    }
                });

                if (data.data.meta.code === 4104){
                    return {
                        data: {},
                        warnings: [],
                        errors: [...data.data.meta.details]
                    }
                }
                
                return {
                    data: {
                        rates: data.data.data.rates.map((rate) => {
                            return {
                                status: 'calculated',
                                chargeWeight: {
                                    ...rate.charge_weight
                                },
                                serviceName: rate.service_name,
                                serviceType: rate.shipper_account.slug,
                                serviceToken: rate.service_type,
                                totalCharge: {
                                    ...rate.total_charge
                                },
                                shipperAccount: {
                                    id: rate.shipper_account.id
                                },
                                detailedCharges: [...rate.detailed_charges]
                            }
                        })
                    },
                    warnings: [],
                    errors: []
                };
            }
        } catch (error) {
            if (error.detail){
                return {
                    data: {},
                    warnings: [],
                    errors: [error.detail]
                }
            }

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
                
                const formatedAddress = {
                    name: address.contactName,
                    company: address.companyName,
                    street1: address.street1,
                    city: address.city,
                    state: address.state,
                    zip: address.zip,
                    country: address.country,
                    phone: address.phone,
                    email: address.email,
                    is_residential: address.is_residential,
                    metadata: address.metadata
                }
                
                const errors = validateSchema(formatedAddress, shippoAddressCreationSchema);
                
                if (errors){
                    return {
                        data: {},
                        warnings: [],
                        errors: errors
                    }
                }

                const resultObject = await shippo.address.create(formatedAddress);
                
                return {
                    data: {
                        address: {
                            id: resultObject.object_id,
                            isComplete: resultObject.is_complete,
                            contactName: resultObject.name,
                            street1: resultObject.street1,
                            city: resultObject.city,
                            state: resultObject.state,
                            zip: resultObject.zip,
                            country: resultObject.country,
                            phone: resultObject.phone,
                            email: resultObject.email,
                            validationResults: resultObject.validation_results
                        }
                    },
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
                const resultObject = await shippo.address.validate(address.id);
                return {
                    data: {
                        id: resultObject.object_id,
                        isComplete: resultObject.is_complete,
                        contactName: resultObject.name,
                        street1: resultObject.street1,
                        city: resultObject.city,
                        state: resultObject.state,
                        zip: resultObject.zip,
                        country: resultObject.country,
                        phone: resultObject.phone,
                        email: resultObject.email,
                        validationResults: {
                            isValid: resultObject.validation_results.is_valid,
                            messages: resultObject.validation_results.messages
                        } 
                    },
                    warnings: [],
                    errors: []
                };
            } 

            if (service === 'postmen'){
                const formatedAddress = {
                    country: address.country,
                    contact_name: address.contactName,
                    phone: address.phone,
                    fax: address.fax,
                    email: address.email,
                    company_name: address.companyName,
                    street1: address.street1,
                    street2: address.street2,
                    street3: address.street3,
                    city: address.city,
                    state: address.state,
                    postal_code: address.postalCode,
                    type: address.type,
                    tax_id: address.taxId
                }

                const errors = validateSchema({ address: formatedAddress }, postmenAddressReqSchema);
                
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
                    data: { address: formatedAddress },
                    headers: { 
                        ...postmentCredentialHeaders.headers
                    }
                });

                if (data.data.meta.code === 4104){
                    return {
                        data: {},
                        warnings: [],
                        errors: [...data.data.meta.details]
                    }
                }

                return {
                    data: {
                        id: data.data.data.id,
                        address: {
                            country: data.data.data.address.country,
                            contactName: data.data.data.address.contact_name,
                            phone: data.data.data.address.phone,
                            fax: data.data.data.address.fax,
                            email: data.data.data.address.email,
                            companyName: data.data.data.address.company_name,
                            street1: data.data.data.address.street1,
                            street2: data.data.data.address.street2,
                            street3: data.data.data.address.street3,
                            city: data.data.data.address.city,
                            state: data.data.data.address.state,
                            postalCode: data.data.data.address.postal_code,
                            type: data.data.data.address.type,
                            taxId: data.data.data.address.tax_id,
                        },
                        status: data.data.data.status,  
                        createdAt: data.data.data.created_at,
                        updatedAt: data.data.data.updated_at,
                    },
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
                const labelFormatedObj = {
                    shipment: {
                        parcels: label.shipment.parcels.map((parcel) => {     
                            return { 
                                width: parcel.width,
                                length: parcel.length,
                                height: parcel.height,
                                mass_unit: parcel.massUnit,
                                distance_unit: parcel.distanceUnit,
                                weight: parcel.weight.value.toString(),     
                            }    
                        }),
                        address_from: {
                            name: label.shipment.shipFrom.contactName,
                            street1: label.shipment.shipFrom.street1,
                            city: label.shipment.shipFrom.city,
                            state: label.shipment.shipFrom.state,
                            zip: label.shipment.shipFrom.zip,
                            country: label.shipment.shipFrom.country,
                            phone: label.shipment.shipFrom.phone,
                            email: label.shipment.shipFrom.email,
                            company_name: label.shipment.shipFrom.companyName,
                        },
                        address_to: {
                            name: label.shipment.shipTo.contactName,
                            street1: label.shipment.shipTo.street1,
                            city: label.shipment.shipTo.city,
                            state: label.shipment.shipTo.state,
                            zip: label.shipment.shipTo.zip,
                            country: label.shipment.shipTo.country,
                            phone: label.shipment.shipTo.phone,
                            email: label.shipment.shipTo.email,
                            company_name: label.shipment.shipFrom.companyName,
                        },
                    },
                    carrier_account: label.shipperAccount.id,
                    servicelevel_token: label.serviceToken
                }
                const errors = validateSchema(labelFormatedObj, shippoCreateLabelSchema);
                
                if (errors){
                    return {
                        data: {},
                        warnings: [],
                        errors: errors
                    }
                }

                const resultObject = await shippo.transaction.create(labelFormatedObj);
                return {
                    data: {
                        id: resultObject.object_id,
                        status: resultObject.status,
                        objectOwner: resultObject.object_owner,
                        createdAt: resultObject.object_created,
                        updatedAt: resultObject.object_updated,
                        rate: {
                            id: resultObject.rate.id,
                            totalCharge: {
                                amount: resultObject.rate.amount,
                                currency: resultObject.rate.currency
                            },
                            shipperAccount: {
                                id: resultObject.rate.carrier_account
                            },
                            localTotalCharge: {
                                amountLocal: resultObject.rate.amount_local,
                                currencyLocal: resultObject.rate.currency_local
                            },
                            serviceName: resultObject.rate.servicelevel_name,
                            serviceToken: resultObject.rate.servicelevel_token
                        },
                        trackingStatus: resultObject.tracking_status,
                    },
                    warnings: [],
                    errors: []
                };
            }   

            if (service === 'postmen'){
                const formatedLabel = {
                    is_document: label.isDocument,
                    service_type: label.serviceType,
                    customs: {
                        billing: {
                            paid_by: label.customs?.billing?.paidBy
                        },
                        purpose: label.customs?.purpose
                    },
                    shipment: {
                        ship_from: {
                            contact_name: label.shipment.shipFrom.contactName,
                            street1: label.shipment.shipFrom.street1,
                            city: label.shipment.shipFrom.city,
                            state: label.shipment.shipFrom.state,
                            country: label.shipment.shipFrom.country,
                            phone: label.shipment.shipFrom.phone,
                            email: label.shipment.shipFrom.email,
                            postal_code: label.shipment.shipFrom.postalCode
                        },
                        ship_to: {
                            contact_name: label.shipment.shipTo.contactName,
                            street1: label.shipment.shipTo.street1,
                            city: label.shipment.shipTo.city,
                            state: label.shipment.shipTo.state,
                            country: label.shipment.shipTo.country,
                            phone: label.shipment.shipTo.phone,
                            email: label.shipment.shipTo.email,
                            postal_code: label.shipment.shipTo.postalCode
                        },
                        parcels: label.shipment.parcels.map((parcel) => {
                            return {
                                box_type: parcel.boxType,
                                description: parcel.description,
                                weight: parcel.weight,
                                dimension: parcel.dimension,
                                items: parcel.items.map((item) => {
                                    return {
                                        description: item.description,
                                        origin_country: item.originCountry,
                                        quantity: item.quantity,
                                        price: item.price,
                                        weight: item.weight,
                                        sku: item.sku
                                    }
                                })
                            }
                        }),
                    },
                    shipper_account: label.shipperAccount
                }

                const errors = validateSchema(formatedLabel, postmenCreateLabelSchema);
            
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
                    data: formatedLabel,
                    headers: { 
                        ...postmentCredentialHeaders.headers
                    }
                });

                if (data.data.meta.code === 4104){
                    return {
                        data: {},
                        warnings: [],
                        errors: [...data.data.meta.details]
                    }
                }

                return {
                    data: {
                        id: data.data.data.id,
                        status: data.data.data.status,
                        trackingNumbers: data.data.data.tracking_numbers,
                        labelUrl: data.data.data.files.label.url,
                        files: {
                            label: {
                                paperSize: data.data.data.files.label.paper_size,
                                url: data.data.data.files.label.url,
                                fileType: data.data.data.files.label.fileType
                            },
                            invoice: {
                                paperSize: data.data.data.files?.invoice?.paper_size,
                                url: data.data.data.files?.invoice?.url,
                                filetType: data.data.data.files?.invoice?.file_type,
                            },
                            customsDeclaration: data.data.data.files.customs_declaration,
                            manifest: data.data.data.files.manifest
                        },
                        rate: {
                            chargeWeight: {
                                ...data.data.data.rate.charge_weight
                            },
                            totalCharge: {
                                ...data.data.data.rate.total_charge
                            },
                            serviceName: data.data.data.rate.service_name,
                            serviceToken: data.data.data.rate.service_type,
                            serviceType: data.data.data.rate.shipper_account.slug,
                            shipperAccount: {
                                ...data.data.data.rate.shipper_account
                            },
                            deliveryDate: data.data.data.rate.delivery_date,
                            detailedCharges: [...data.data.data.rate.detailed_charges]
                        },
                        createdAt: data.data.data.created_at,
                        updatedAt: data.data.data.updated_at,
                    },
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
                errors: [error.detail ? error.detail : error.message]
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
                    data: {
                        labels: resultObject.results.map((label) => {
                            return {
                                id: label.object_id,
                                status: label.status,  
                                objectOwner: label.object_owner,
                                trackingNumbers: [label.tracking_number],
                                trackingStatus: label.tracking_status,
                                rate: [{ 
                                    id: label.rate
                                }],
                                labelUrl: label.label_url,
                                qrCodeUrl: label.qr_code_url,
                                createdAt: label.object_created,
                                updatedAt: label.object_updated
                            }
                        })
                    },
                    warnings: [],
                    errors: []
                };
            }

            if (service === 'postmen'){
                const data = await axios.get(`${postmenURL}/labels`, postmentCredentialHeaders);

                if (data.data.meta.code === 4104){
                    return {
                        data: {},
                        warnings: [],
                        errors: [...data.data.meta.details]
                    }
                }

                return {
                    data: {
                        labels: data.data.data.labels.map((label) => {
                            return {   
                                id: label.id,
                                status: label.status,
                                trackingNumbers: label.tracking_numbers,
                                labelUrl: label.files.label.url,
                                files: {
                                    label: {
                                        paperSize: label.files.label.paper_size,
                                        url: label.files.label.url,
                                        fileType: label.files.label.fileType
                                    },
                                    invoice: {
                                        paperSize: label.files?.invoice?.paper_size,
                                        url: label.files?.invoice?.url,
                                        filetType: label.files?.invoice?.file_type,
                                    },
                                    customsDeclaration: label.files?.customs_declaration,
                                    manifest: label.files?.manifest
                                },
                                rate: {
                                    chargeWeight: {
                                        ...label.rate.charge_weight
                                    },
                                    totalCharge: {
                                        ...label.rate.total_charge
                                    },
                                    serviceName: label.rate.service_name,
                                    serviceToken: label.rate.service_type,
                                    serviceType: label.rate.shipper_account.slug,
                                    shipperAccount: {
                                        ...label.rate.shipper_account
                                    },
                                    deliveryDate: label.rate.delivery_date,
                                    detailedCharges: [...label.rate.detailed_charges]
                                },
                                createdAt: label.created_at,
                                updatedAt: label.updated_at,
                            }

                        })
                    },
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
                    data: {
                        manifests: data.data.results.map((manifest) => {
                            return {
                                id: manifest.object_id,
                                status: manifest.status,
                                createdAt: manifest.object_created,
                                shipmentDate: manifest.shipment_date,
                                updated: manifest.object_updated,
                                shipFromId: manifest.address_from,
                                shipperAccount: {
                                    id: manifest.carrier_account
                                },
                                documents: manifest.documents,
                                transactions: manifest.transactions
                            }
                        })
                    },
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

                if (data.data.meta.code === 4104){
                    return {
                        data: {},
                        warnings: [],
                        errors: [...data.data.meta.details]
                    }
                }

                return {
                    data: {
                        manifests: data.data.data.manifests.map((manifest) => {
                            return {
                                id: manifest.id,
                                status: manifest.status,
                                labels: [...manifest.labels],
                                files: {
                                    label: manifest?.files?.label,
                                    invoice: manifest?.files?.invoice,
                                    customsDeclaration: manifest?.files?.customs_declaration,
                                    manifest: {
                                        paperSize: manifest?.files?.manifest?.paper_size,
                                        url:  manifest?.files?.manifest?.url,
                                        fileType: manifest?.files?.manifest?.file_type
                                    }
                                },  
                                updatedAt: manifest.updated_at,
                                createdAt: manifest.created_at
                            }
                        })
                    },
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

    static async getManifest(service, manifestId) {
        /* 
            To get shippo/postmen manifest, we need to provide a manifest id,
            manifests can be created using the method createManifest,
            see tests for body definition
        */
        try {    
            if (service === 'shippo'){
                const manifest = await shippo.manifest.retrieve(manifestId);
                return {
                    data: {
                        id: manifest.object_id,
                        status: manifest.status,
                        createdAt: manifest.object_created,
                        shipmentDate: manifest.shipment_date,
                        updated: manifest.object_updated,
                        shipFromId: manifest.address_from,
                        shipperAccount: {
                            id: manifest.carrier_account
                        },
                        documents: manifest.documents,
                        transactions: manifest.transactions
                    },
                    warnings: [],
                    errors: []
                };
            }   

            if (service === 'postmen'){
                const data = await axios.get(`${postmenURL}/manifests/${manifestId}`, postmentCredentialHeaders);

                if (data.data.meta.code === 4104 && !data.data.data.id){
                    return {
                        data: {},
                        warnings: [],
                        errors: [...data.data.meta.details]
                    }
                }

                if (data.data.meta.message && !data.data.data.id){
                    return {
                        data: {},
                        warnings: [],
                        errors: [data.data.meta.message]
                    }
                }

                const manifest = data.data.data;
                return {
                    data: {
                        id: manifest.id,
                        status: manifest.status,
                        labels: manifest.labels,
                        files: {
                            label: manifest?.files?.label,
                            invoice: manifest?.files?.invoice,
                            customsDeclaration: manifest?.files?.customs_declaration,
                            manifest: {
                                paperSize: manifest?.files?.manifest?.paper_size,
                                url:  manifest?.files?.manifest?.url,
                                fileType: manifest?.files?.manifest?.file_type
                            }
                        },  
                        updatedAt: manifest.updated_at,
                        createdAt: manifest.created_at
                    },
                    warnings: [],
                    errors: []
                };
            }
        } catch (error) {
            console.log("error", error);
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

    static async createTracking(service, trackingObj){
        /* 
            To create a tracking, we need to provide a body with the 
            following properties
        */
        try {
            if (service === 'postmen'){
                const formatedObj = {
                    tracking_number: trackingObj.trackingNumber,
                    slug: trackingObj.slug,
                    title: trackingObj.title,
                    smses: trackingObj.smses,
                    emails: trackingObj.emails,
                    order_id: trackingObj.orderId,
                    order_id_path: trackingObj.orderIdPath,
                    custom_fields: {
                        product_name: trackingObj.customFields.productName,
                        product_price: trackingObj.customFields.productPrice
                    },
                    language: trackingObj.language,
                    order_promised_delivery_date: trackingObj.orderPromisedDeliveryDate,
                    delivery_type: trackingObj.deliveryType,
                    pickup_location: trackingObj.pickupLocation
                }

                const data = await axios({ 
                    method: 'post',
                    url: `${process.env.AFTER_SHIP_URL}/trackings`,
                    data: { tracking: formatedObj },
                    headers: { 
                        ...afterShipHeaders.headers
                    }
                });

                console.log("data", data.data);

                if (data.data.meta.code === 4104){
                    return {
                        data: {},
                        warnings: [],
                        errors: [...data.data.meta.details]
                    }
                }

                const tracking = data.data.data.tracking;

                return {
                    data: {
                        tracking: {
                            id: tracking.id,
                            serviceType: tracking.slug,
                            slug: tracking.slug,
                            customerName: tracking.customer_name,
                            active: tracking.active,
                            note: tracking.note,
                            orderId: tracking.order_id,
                            shipmentPackageCount: tracking.shipment_package_count,
                            shipmentPickupDate: tracking.shipment_pickup_date,
                            shipmentDeliveryDate: tracking.shipment_delivery_date,
                            shipmentType: tracking.shipment_type,
                            shipmentWeight: tracking.shipment_weight,
                            shipmentWeightUnit: tracking.shipment_weight_unit,
                            signedBy: tracking.signed_by,
                            source: tracking.source,
                            tag: tracking.tag,
                            subtag: tracking.subtag,
                            subtagMessage: tracking.subtag_message,
                            title: tracking.title,
                            trackedCount: tracking.tracked_count,
                            lastMileTrackingSupported: tracking.last_mile_tracking_supported,
                            language: tracking.language,
                            uniqueToken: tracking.unique_token,
                            subscribedSmses: tracking.subscribed_smses,
                            subscribedEmails: tracking.subscribed_emails,
                            returnToSender: tracking.return_to_sender,
                            trackingAccountNumber: tracking.tracking_account_number,
                            trackingOriginCountry: tracking.tracking_origin_country,
                            trackingDestinationCountry: tracking.tracking_destination_country,
                            trackingKey: tracking.tracking_key,
                            trackingPostalCode: tracking.tracking_postal_code,
                            trackingShipDate: tracking.tracking_ship_date,
                            trackingState: tracking.tracking_state,
                            orderPromisedDeliveryDate: tracking.order_promised_delivery_date,
                            deliveryType: tracking.delivery_type,
                            pickupLocation: tracking.pickup_location,
                            pickupNote: tracking.pickup_note,
                            courierTrackingLink: tracking.courier_tracking_link,
                            courierRedirectLink: tracking.courier_redirect_link,
                            firstAttemptedAt: tracking.first_attempted_at,
                            orderIdPath: tracking.order_id_path,
                            deliveryTime: tracking.delivery_time,
                            customFields: tracking.custom_fields,
                            trackingNumber: tracking.tracking_number,
                            lastUpdatedAt: tracking.last_updated_at,
                            updatedAt: tracking.updated_at,
                            createdAt: tracking.created_at,
                            expectedDelivery: tracking.expected_delivery,
                            originCountryIso3: tracking.origin_country_iso3,
                            destinationCountryIso3: tracking.destination_country_iso3,
                            courierDestinationCountryIso3: tracking.courier_destination_country_iso3,
                        },
                    },
                    warnings: [],
                    errors: []
                };
            }
        } catch (error){
            console.log("error", error.response.data);
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
                    data: {
                        trackings: data.data.data.trackings.map((tracking) => {
                            return {
                                id: tracking.id,
                                serviceType: tracking.slug,
                                slug: tracking.slug,
                                customerName: tracking.customer_name,
                                active: tracking.active,
                                note: tracking.note,
                                orderId: tracking.order_id,
                                shipmentPackageCount: tracking.shipment_package_count,
                                shipmentPickupDate: tracking.shipment_pickup_date,
                                shipmentDeliveryDate: tracking.shipment_delivery_date,
                                shipmentType: tracking.shipment_type,
                                shipmentWeight: tracking.shipment_weight,
                                shipmentWeightUnit: tracking.shipment_weight_unit,
                                signedBy: tracking.signed_by,
                                source: tracking.source,
                                tag: tracking.tag,
                                subtag: tracking.subtag,
                                subtagMessage: tracking.subtag_message,
                                title: tracking.title,
                                trackedCount: tracking.tracked_count,
                                lastMileTrackingSupported: tracking.last_mile_tracking_supported,
                                language: tracking.language,
                                uniqueToken: tracking.unique_token,
                                subscribedSmses: tracking.subscribed_smses,
                                subscribedEmails: tracking.subscribed_emails,
                                returnToSender: tracking.return_to_sender,
                                trackingAccountNumber: tracking.tracking_account_number,
                                trackingOriginCountry: tracking.tracking_origin_country,
                                trackingDestinationCountry: tracking.tracking_destination_country,
                                trackingKey: tracking.tracking_key,
                                trackingPostalCode: tracking.tracking_postal_code,
                                trackingShipDate: tracking.tracking_ship_date,
                                trackingState: tracking.tracking_state,
                                orderPromisedDeliveryDate: tracking.order_promised_delivery_date,
                                deliveryType: tracking.delivery_type,
                                pickupLocation: tracking.pickup_location,
                                pickupNote: tracking.pickup_note,
                                courierTrackingLink: tracking.courier_tracking_link,
                                courierRedirectLink: tracking.courier_redirect_link,
                                firstAttemptedAt: tracking.first_attempted_at,
                                orderIdPath: tracking.order_id_path,
                                deliveryTime: tracking.delivery_time,
                                customFields: tracking.custom_fields,
                                trackingNumber: tracking.tracking_number,
                                lastUpdatedAt: tracking.last_updated_at,
                                updatedAt: tracking.updated_at,
                                createdAt: tracking.created_at,
                                expectedDelivery: tracking.expected_delivery,
                                originCountryIso3: tracking.origin_country_iso3,
                                destinationCountryIso3: tracking.destination_country_iso3,
                                courierDestinationCountryIso3: tracking.courier_destination_country_iso3,
                            }
                        })
                    },
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

    static async getShipments(service) {
        try {
            if (service === "shippo"){
                const data = await axios({ 
                    method: 'get',
                    url: `${process.env.SHIPPO_URL}/shipments`,
                    headers: { 
                        ...shippoCredentialHeaders.headers
                    }
                });

                return {
                    data: {
                        shipments: data.data.results.map((shipment) => {
                            return {
                                id: shipment.object_id,
                                createdAt: shipment.object_created,
                                updatedAt: shipment.object_updated,
                                objectOwner: shipment.object_owner,
                                shipFrom: {
                                    id: shipment.address_from.object_id,
                                    isComplete: shipment.address_from.is_complete,
                                    contactName: shipment.address_from.name,
                                    street1: shipment.address_from.street1,
                                    city: shipment.address_from.city,
                                    state: shipment.address_from.state,
                                    zip: shipment.address_from.zip,
                                    country: shipment.address_from.country,
                                    phone: shipment.address_from.phone,
                                    email: shipment.address_from.email,
                                    validationResults: shipment.address_from.validation_results
                                },
                                shipTo: {
                                    id: shipment.address_to.object_id,
                                    isComplete: shipment.address_to.is_complete,
                                    contactName: shipment.address_to.name,
                                    street1: shipment.address_to.street1,
                                    city: shipment.address_to.city,
                                    state: shipment.address_to.state,
                                    zip: shipment.address_to.zip,
                                    country: shipment.address_to.country,
                                    phone: shipment.address_to.phone,
                                    email: shipment.address_to.email,
                                    validationResults: shipment.address_to.validation_results
                                },
                                addressReturn: {
                                    id: shipment.address_return.object_id,
                                    isComplete: shipment.address_return.is_complete,
                                    contactName: shipment.address_return.name,
                                    street1: shipment.address_return.street1,
                                    city: shipment.address_return.city,
                                    state: shipment.address_return.state,
                                    zip: shipment.address_return.zip,
                                    country: shipment.address_return.country,
                                    phone: shipment.address_return.phone,
                                    email: shipment.address_return.email,
                                    validationResults: shipment.address_return.validation_results
                                },
                                status: shipment.status,
                                parcels: shipment.parcels.map((parcel) => {
                                    return {
                                        id: parcel.object_id,
                                        length: parcel.length,
                                        width: parcel.width,
                                        height: parcel.height,
                                        distanceUnit: parcel.distance_unit,
                                        weight: {
                                            value: parcel.weight,
                                            unit: parcel.mass_unit
                                        }
                                    }
                                }),
                                rates: shipment.rates.map((rate) => {
                                    return {
                                        id: rate.object_id,
                                        status: rate.status,
                                        serviceType: rate.provider,
                                        serviceToken: rate.servicelevel.token,
                                        serviceName: rate.servicelevel.name,
                                        shipperAccount: {
                                            id: rate.carrier_account
                                        },
                                        createdAt: rate.object_created,
                                        totalCharge: {
                                            amount: rate.amount,
	                                        currency: rate.currency
                                        },
                                        localTotalCharge: {
                                            amountLocal: rate.amount_local,
                                            currencyLocal: rate.currency_local
                                        },
                                        durationTerms: rate.duration_terms,
                                        updatedAt: rate.object_updated,
                                    }
                                })
                            }
                        })
                    },
                    warnings: [],
                    errors: []
                }
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

    static async getTracking(service, trackingObj) {
        /* 
            To get shippo tracking status, we need to provide a tracking carrier and number and 
            as for postmen we need to provide a slug(courier e.g fedex) and an id,
            tracking can be create using the createTracking method
        */
        try {    
            if (service === 'shippo'){
                const data = await axios.get(`${process.env.SHIPPO_URL}/tracks/${trackingObj.trackingSlug}/${trackingObj.trackingNumber}`, shippoCredentialHeaders);
                return {
                    data: {
                        tracking: {
                            slug: trackingObj.trackingSlug,
                            shipFrom: {
                                street1: data.data.address_from.street1,
                                city: data.data.address_from.city,
                                state: data.data.address_from.state,
                                zip: data.data.address_from.zip,
                                country: data.data.address_from.country,
                            },
                            shipTo: {
                                street1: data.data.address_to.street1,
                                city: data.data.address_to.city,
                                state: data.data.address_to.state,
                                zip: data.data.address_to.zip,
                                country: data.data.address_to.country,
                            },
                            serviceToken: data.data.servicelevel.token,
                            serviceType: data.data.carrier,
                            serviceName: data.data.servicelevel.name,
                            deliveryType: data.data.servicelevel.token,
                            trackingNumber: data.data.tracking_number,
                            transaction: data.data.transaction,
                            trackingStatus: {
                                id: data.data.tracking_status.object_id,
                                status: data.data.tracking_status.status,
                                statusDetails: data.data.tracking_status.status_details,
                                statusDate: data.data.tracking_status.status_date,
                                createdAt: data.data.tracking_status.object_created,
                                updatedAt: data.data.tracking_status.object_created,
                                location: data.data.tracking_status.location
                            },
                            trackingHistory: data.data.tracking_history.map((history) => {
                                return {
                                    status: history.status,
                                    statusDetails: history.status_details,
                                    statusDate: history.status_date,
                                    createdAt: history.object_created,
                                    updatedAt: history.object_created,
                                }
                            })
                        }
                    },
                    warnings: [],
                    errors: []
                };
            }
            
            if (service === 'postmen') {
                const errors = validateSchema(trackingObj, postmenGetTrackingSchema);
                
                if (errors){
                    return {
                        data: {},
                        warnings: [],
                        errors: errors
                    }
                }

                const URL = `${process.env.AFTER_SHIP_URL}/trackings/${trackingObj.trackingSlug}/${trackingObj.trackingNumber}`
                const data = await axios.get(URL, afterShipHeaders);

                if (data.data.meta.code === 4104){
                    return {
                        data: {},
                        warnings: [],
                        errors: [...data.data.meta.details]
                    }
                }

                const tracking = data.data.data.tracking;

                return {
                    data: {
                        tracking: {
                            id: tracking.id,
                            serviceType: tracking.slug,
                            slug: tracking.slug,
                            customerName: tracking.customer_name,
                            active: tracking.active,
                            note: tracking.note,
                            orderId: tracking.order_id,
                            shipmentPackageCount: tracking.shipment_package_count,
                            shipmentPickupDate: tracking.shipment_pickup_date,
                            shipmentDeliveryDate: tracking.shipment_delivery_date,
                            shipmentType: tracking.shipment_type,
                            shipmentWeight: tracking.shipment_weight,
                            shipmentWeightUnit: tracking.shipment_weight_unit,
                            signedBy: tracking.signed_by,
                            source: tracking.source,
                            tag: tracking.tag,
                            subtag: tracking.subtag,
                            subtagMessage: tracking.subtag_message,
                            title: tracking.title,
                            trackedCount: tracking.tracked_count,
                            lastMileTrackingSupported: tracking.last_mile_tracking_supported,
                            language: tracking.language,
                            uniqueToken: tracking.unique_token,
                            subscribedSmses: tracking.subscribed_smses,
                            subscribedEmails: tracking.subscribed_emails,
                            returnToSender: tracking.return_to_sender,
                            trackingAccountNumber: tracking.tracking_account_number,
                            trackingOriginCountry: tracking.tracking_origin_country,
                            trackingDestinationCountry: tracking.tracking_destination_country,
                            trackingKey: tracking.tracking_key,
                            trackingPostalCode: tracking.tracking_postal_code,
                            trackingShipDate: tracking.tracking_ship_date,
                            trackingState: tracking.tracking_state,
                            orderPromisedDeliveryDate: tracking.order_promised_delivery_date,
                            deliveryType: tracking.delivery_type,
                            pickupLocation: tracking.pickup_location,
                            pickupNote: tracking.pickup_note,
                            courierTrackingLink: tracking.courier_tracking_link,
                            courierRedirectLink: tracking.courier_redirect_link,
                            firstAttemptedAt: tracking.first_attempted_at,
                            orderIdPath: tracking.order_id_path,
                            deliveryTime: tracking.delivery_time,
                            customFields: tracking.custom_fields,
                            trackingNumber: tracking.tracking_number,
                            lastUpdatedAt: tracking.last_updated_at,
                            updatedAt: tracking.updated_at,
                            createdAt: tracking.created_at,
                            expectedDelivery: tracking.expected_delivery,
                            originCountryIso3: tracking.origin_country_iso3,
                            destinationCountryIso3: tracking.destination_country_iso3,
                            courierDestinationCountryIso3: tracking.courier_destination_country_iso3,
                        }
                    },
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

    static async deleteLabel(service, labelId) {
        /* 
            To cancel postmen label, we need to provide the label id
            this can be got using getLabels
        */
        try { 
            if (service === 'shippo'){
                const data = await shippo.refund.create({
                    transaction: labelId
                });
                
                return {
                    data: {
                        id: data.object_id,
                        status: data.status,
                        transaction: data.transaction,
                        objectOwner: data.objectOwner,
                        createdAt: data.object_created,
                        updatedAt: data.object_updated,
                    },
                    warnings: [],
                    errors: []
                };
            }

            if (service === 'postmen'){

                const data = await axios({ 
                    method: 'post',
                    url: `${postmenURL}/cancel-labels`,
                    data: { 
                        label: { id: labelId }, 
                        async: false
                    },
                    headers: { ...postmentCredentialHeaders.headers }
                });

                if (data.data.meta.code === 4104){
                    return {
                        data: {},
                        warnings: [],
                        errors: [...data.data.meta.details]
                    }
                }

                if (data.data.meta.code === 4153){
                    return {
                        data: {},
                        warnings: [],
                        errors: [data.data.meta.message]
                    }
                }

                return {
                    data: {
                        id: data.data.data.id,
                        status: data.data.data.status,
                        createdAt: data.data.data.createdAt,
                        updatedAt: data.data.data.updatedAt
                    },
                    warnings: [],
                    errors: []
                };
            }   
        } catch (error) {
            if (error.detail){
                return {
                    data: {},
                    warnings: [],
                    errors: [error.detail]
                }
            }

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