import Ajv from "ajv"

const ajv = new Ajv();

<<<<<<< HEAD
const validateSchema = (object, schema) => {
    const validate = ajv.compile(schema);
    const valid = validate(object);
    
    if (!valid){
        return validate.errors
    }

    return null 
}

const postmenAddressReqSchema = {
    type: "object",
    properties: {
        address: {
            type: "object",
            properties: {
                contact_name: {type: "string" },
                street1: {type: "string"},
                city: {type: "string"},
                state: {type: "string"},
                postal_code: {type: "string"},
                country: {type: "string"},
                type: {type: "string"},
                phone: {type: "string"},
                email: {type: "string"}
            },
            required: ["street1", "city", "state", "country"],
            additionalProperties: true
        }  
    },
    required: ["address"],
    additionalProperties: true
}

const postmenCreateShipperAccount = {
    type: "object",
    properties: {
        slug: {type: "string" },
        description: {type: "string"},
        timezone: {type: "string"},
        settings: {type: "object"},
        credentials: {
            type: "object",
            properties: {
                account_number: {type: "string"},
                password: {type: "string"},
                site_id: {type: "string"},
            },
            required: ["account_number", "password", "site_id"],
            additionalProperties: false
        },
        address: {
            type: "object",
            properties: {
                country: "HKG",
                contact_name: "Sir Foo",
                phone: "11111111",
                fax: "+1 206-654-3100",
                email: "foo@foo.com",
                company_name: "Foo Store",
                street1: "Workshop A, 10/F, Wah Shing Industrial Building",
                street2: "18 Cheung Shun Street, Lai Chi Kok",
                city: "Lai Chi Kok",
                type: "business",
                postal_code: null,
                state: null,
                street3: null,
                tax_id: null
            },
            required: ["country", "contact_name", "type", "city", "street1", "postal_code"],
            additionalProperties: true
        },

    },
    required: ["address", "credentials", "timezone", "description", "slug"],
    additionalProperties: false
}

const postmenCreateLabelSchema = {
    type: "object",
    properties: {
        service_type: { type: "string" },
        return_shipment: { type: "boolean" },
        is_document: { type: "boolean" },
        references: { type: "array" },
        shipper_account: {
            type: "object",
            properties: {
                id: {type: "string" }
            },
            required: ["id"],
            additionalProperties: true
        },
        billing: {
            type: "object",
            properties: {
                paid_by: {type: "string"}
            },
            required: ['paid_by'],
            additionalProperties: true,
        },
        invoice: {
            type: "object",
            properties: {
                date: {type: "string"},
                number: {type: "string"}
            },
            required: ['date', 'number'],
            additionalProperties: false
        },
        customs: {
            type: "object",
            properties: {
                billing: {
                    type: "object",
                    properties: {
                        paid_by: { type: "string" }
                    }
                },
                terms_of_trade: { type: "string" },
                purpose: { type: "string" },
                
            },
            required: ["billing", "purpose"],
            additionalProperties: true,
        },
    },
    required: ["service_type", "is_document", "shipper_account"],
    additionalProperties: true,
}


const postmenRatesResponseSchema = {
    type: "object",
    properties: {
        next_token: {type: "string"},
        limit: {type: "string"},
        rates: {type: "string"},
        created_at_max: {type: "string"},
=======
const postmenAddressReqSchema = {
    type: "object",
    properties: {
        contact_name: "string",
        street1: "string",
        city: "string",
        state: "string",
        postal_code: "string",
        country: "string",
        type: "string",
        phone: "string",
        email: "string"
    },
    additionalProperties: false
}

const postmenRatesResponseSchema = {
    type: "object",
    properties: {
        next_token: "string",
        limit: "string",
        rates: "string",
        created_at_max: "string",
>>>>>>> Create item.js
        created_at_min: "string"
    },
    required: ["rates", "next_token", "limit"],
    additionalProperties: true
}

const postmenLabelsResponseSchema = {
    type: "object",
    properties: {
<<<<<<< HEAD
        next_token: {type: "string"},
        limit: {type: "string"},
        rates: {type: "string"},
        created_at_max: {type: "string"},
=======
        next_token: "string",
        limit: "string",
        rates: "string",
        created_at_max: "string",
>>>>>>> Create item.js
        created_at_min: "string"
    },
    required: ["rates", "next_token", "limit"],
    additionalProperties: true
}

const postmenAddValRespSchema = {
<<<<<<< HEAD
    type: {type: "object"},
    properties: {
        id: {type: "string"},
        status: {type: "string"},
        created_at: {type: "string"},
        updated_at: {type: "string"},
        address: {type: "object"},
=======
    type: "object",
    properties: {
        id: "string",
        status: "string",
        created_at: "string",
        updated_at: "string",
        address: "object",
>>>>>>> Create item.js
        recommended_address: "object"
    },
    required: ["id", "status", "created_at", "updated_at", "address"],
    additionalProperties: true
}

const postmenManifestReqSchema = {
    type: "object",
    properties: {
<<<<<<< HEAD
        shipper_account: {
            type: "object",
            properties: {
                id: { type: "string" },
            }
        },
        async: {type: "boolean"},
        label_ids: {type: "array"}
=======
        shipper_account: "object",
        async: "boolean",
       label_ids: "array"
>>>>>>> Create item.js
    },
    required: ["shipper_account"],
    additionalProperties: true
}

<<<<<<< HEAD
const postmenGetTrackingSchema = {
    type: "object",
    properties: {
        trackingNumber: { type: "string" },
        trackingSlug: { type: "string" }
    },
    required: ["trackingNumber", "trackingSlug"],
    additionalProperties: false,
}

const postmenCalculateSchema = {
    type: "object",
    properties: {
        async: {type: "boolean"},
        shipment: {
            type: "object",
            properties: {
                parcels: { type: "array" },
                ship_from: { 
                    type: "object",
                    properties: {
                        contact_name: { type: "string" },
                        street1: { type: "string" },
                        city: { type: "string" },
                        state: { type: "string" },
                        country: { type: "string" },
                        phone: { type: "string" },
                        email: { type: "string" },
                        type: { type: "string" }
                    },
                    required: ["contact_name", "street1", "city", "country", "phone"],
                    additionalProperties: true
                },
                ship_to: {
                    type: "object",
                    properties: {
                        contact_name: { type: "string" },
                        street1: { type: "string" },
                        city: { type: "string" },
                        state: { type: "string" },
                        postal_code: { type: "string" },
                        country:{ type: "string" },
                        phone: { type: "string" },
                        email: { type: "string" },
                        type: { type: "string" },
                    },
                    required: [
                        "contact_name",
                        "street1",
                        "city",
                        "state",
                        "country",
                        "phone",
                    ],
                    additionalProperties: true
                }, 
            },
            required: ["ship_from", "ship_to", "parcels"],
            additionalProperties: true
        },
        shipper_accounts: { type: "array" }
    },
    required: ["shipment", "shipper_accounts"],
    additionalProperties: true
}

const postmenManifestRespSchema = {
    type: {type: "object"},
    properties: {
        id: {type: "string"},
        status: {type: "string"},
        created_at: {type: "string"},
        updated_at: {type: "string"},
        labels: {type: "array"},
        files: {type: "array"}
=======
const postmenManifestRespSchema = {
    type: "object",
    properties: {
        id: "string",
        status: "string",
        created_at: "string",
        updated_at: "string",
        labels: "array",
        files: "array"
>>>>>>> Create item.js
    },
    required: ["id", "status", "created_at", "updated_at", "labels"],
    additionalProperties: true
}

const postmenGetTrackRespSchema = {
    type: "object",
    properties: {
<<<<<<< HEAD
        page: {type: "string"},
        limit: {type: "string"},
        count: {type: "string"},
        slug: {type: "string"},
        created_at: {type: "string"},
        updated_at: {type: "string"},
=======
        page: "string",
        limit: "string",
        count: "string",
        slug: "string",
        created_at: "string",
        updated_at: "string",
>>>>>>> Create item.js
    },
    required: ["page", "limit", "created_at", "updated_at", "count", "slug"],
    additionalProperties: true
}

<<<<<<< HEAD
const shippoCreateShipmentSchema = {
    type: "object",
    properties: {
        address_from: { 
            type: "object",
            properties: {
                name: {type: "string"},
                street1: {type: "string"},
                city: {type: "string"},
                state: {type: "string"},
                zip: {type: "string"},
                country: {type: "string"}
            },
            required: ["name", "street1", "city", "state", "country", "zip"],
            additionalProperties: true
        },
        address_to: { 
            type: "object",
            properties: {
                name: {type: "string"},
                street1: {type: "string"},
                city: {type: "string"},
                state: {type: "string"},
                zip: {type: "string"},
                country: {type: "string"}
            },
            required: ["name", "street1", "city", "state", "country", "zip"],
            additionalProperties: true
        },
        parcels: { type: "array" }
    },
    required: ["parcels", "address_to", "address_from"],
    additionalProperties: false
}

const shippoGetRatesSchema = {
    type: {type: "object"},
    properties: {
        next: {type: "string"},
        previous: {type: "string"},
        results: {type: "array"},
=======
const shippoGetRatesSchema = {
    type: "object",
    properties: {
        next: "string",
        previous: "string",
        results: "array",
>>>>>>> Create item.js
    },
    required: ["next", "previos", "results"],
    additionalProperties: true
}

const shippoGetLabelsSchema = {
<<<<<<< HEAD
    type: {type: "object"},
    properties: {
        next: {type: "string"},
        previous: {type: "string"},
        results: {type: "array"},
=======
    type: "object",
    properties: {
        next: "string",
        previous: "string",
        results: "array",
>>>>>>> Create item.js
    },
    required: ["next", "previos", "results"],
    additionalProperties: true
}

const shippoValidateAddRespSchema = {
<<<<<<< HEAD
    type: {type: "object"},
    properties: {
        is_complete: {type: "boolean"},
        object_created: {type: "string"},
        object_updated: {type: "string"},
        object_id: {type: "string"},
        object_owner: {type: "string"},
        name: {type: "string"},
        company: {type: "string"},
        street_no: {type: "string"},
        street1:{type: "string"},
        street2: {type: "string"},
        city: {type: "string"},
        state:{type: "string"},
        zip: {type: "string"},
        country: {type: "string"},
        phone: {type: "string"},
        email: {type: "string"},
        is_residential: {type: "boolean"},
        metadata: {type: "string"},
        test: {type: "boolean"},
        validation_results: {type: "oject"},
=======
    type: "object",
    properties: {
        is_complete: "boolean",
        object_created: "string",
        object_updated: "string",
        object_id: "string",
        object_owner: "string",
        name: "string",
        company: "string",
        street_no: "string",
        street1:"string",
        street2: "string",
        city: "string",
        state:"string",
        zip: "string",
        country: "string",
        phone: "string",
        email: "string",
        is_residential: "boolean",
        metadata: "string",
        test: "boolean",
        validation_results: "object"
>>>>>>> Create item.js
    },
    required: [
        "is_complete",
        "object_created",
        "object_updated",
        "object_id",
        "name",
        "company",
        "street_no",
        "street1",
        "city",
        "state",
        "zip",
        "country",
        "phone",
        "email",
        "street2"
    ],
    additionalProperties: true
}

const shippoGetManifestSchema = {
    type: "object",
    properties: {
<<<<<<< HEAD
        object_created: {type: "string"},
        object_updated: {type: "string"},
        object_id: {type: "string"},
        object_owner: {type: "string"},
        carrier_account: {type: "string"},
        shipment_date: {type: "string"},
        status: {type: "string"},
        address_from: {type: "string"},
        transactions: {type: "array"},
        documents: {type: "array"}
=======
        object_created: "string",
        object_updated: "string",
        object_id: "string",
        object_owner: "string",
        carrier_account: "string",
        shipment_date: "string",
        status: "string",
        address_from: "string",
        transactions: "array",
        documents: "array"
>>>>>>> Create item.js
    },
    required: [
        "is_complete",
        "object_created",
        "object_updated",
        "object_id",
        "object_owner",
        "carrier_account",
        "shipment_date",
        "address_from",
        "transactions",
        "documents"
    ],
    additionalProperties: true
}

<<<<<<< HEAD
const shippoCarrierAccountSchema = {
    type: "object",
    properties: {
        carrier: { type: "string" }, 
        account_id: { type: "string" }, 
        parameters: { type: "string" },
        active: { type: "boolean" },
        test: { type: "boolean" },
    }
}

const shippoCreateManifestSchema = {
    type: "object",
    properties: {
        carrier_account: {type: "string"},
        shipment_date: {type: "string"},
        transactions: { type: "array" }
    },
    required: ["carrier_account", "shipment_date"],
    additionalProperties: true
}

const shippoAddressCreationSchema = {
    type: "object",
    properties: {
        name: {type: "string"},
        company: {type: "string"},
        street1: {type: "string"},
        city: {type: "string"},
        state: {type: "string"},
        zip: {type: "string"},
        country: {type: "string"},
        phone: {type: "string"},
        email: {type: "string"},
    },
    required: ["street1", "city", "state", "zip", "country"],
    additionalProperties: true
}

const shippoCreateLabelSchema = {
    type: "object",
    properties: {
        label_file_type: { type: "string" },
        rate: { type: "string" }
    },
    required: ["rate"],
    additionalProperties: false
}

=======
>>>>>>> Create item.js
export { 
    postmenAddressReqSchema,
    postmenRatesResponseSchema,
    postmenLabelsResponseSchema,
    postmenAddValRespSchema,
    postmenGetTrackRespSchema,
    postmenManifestRespSchema,
    postmenManifestReqSchema,
    shippoGetRatesSchema,
    shippoGetLabelsSchema,
    shippoValidateAddRespSchema,
    shippoGetManifestSchema,
    ajv,
<<<<<<< HEAD
    validateSchema,
    postmenCalculateSchema,
    postmenGetTrackingSchema,
    postmenCreateShipperAccount,
    postmenCreateLabelSchema,
    shippoCreateShipmentSchema,
    shippoCarrierAccountSchema,
    shippoCreateManifestSchema,
    shippoAddressCreationSchema,
    shippoCreateLabelSchema
=======
>>>>>>> Create item.js
};