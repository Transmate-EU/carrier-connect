import Ajv from "ajv"

const ajv = new Ajv();

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
        created_at_min: "string"
    },
    required: ["rates", "next_token", "limit"],
    additionalProperties: true
}

const postmenLabelsResponseSchema = {
    type: "object",
    properties: {
        next_token: "string",
        limit: "string",
        rates: "string",
        created_at_max: "string",
        created_at_min: "string"
    },
    required: ["rates", "next_token", "limit"],
    additionalProperties: true
}

const postmenAddValRespSchema = {
    type: "object",
    properties: {
        id: "string",
        status: "string",
        created_at: "string",
        updated_at: "string",
        address: "object",
        recommended_address: "object"
    },
    required: ["id", "status", "created_at", "updated_at", "address"],
    additionalProperties: true
}

const postmenManifestReqSchema = {
    type: "object",
    properties: {
        shipper_account: "object",
        async: "boolean",
       label_ids: "array"
    },
    required: ["shipper_account"],
    additionalProperties: true
}

const postmenManifestRespSchema = {
    type: "object",
    properties: {
        id: "string",
        status: "string",
        created_at: "string",
        updated_at: "string",
        labels: "array",
        files: "array"
    },
    required: ["id", "status", "created_at", "updated_at", "labels"],
    additionalProperties: true
}

const postmenGetTrackRespSchema = {
    type: "object",
    properties: {
        page: "string",
        limit: "string",
        count: "string",
        slug: "string",
        created_at: "string",
        updated_at: "string",
    },
    required: ["page", "limit", "created_at", "updated_at", "count", "slug"],
    additionalProperties: true
}

const shippoGetRatesSchema = {
    type: "object",
    properties: {
        next: "string",
        previous: "string",
        results: "array",
    },
    required: ["next", "previos", "results"],
    additionalProperties: true
}

const shippoGetLabelsSchema = {
    type: "object",
    properties: {
        next: "string",
        previous: "string",
        results: "array",
    },
    required: ["next", "previos", "results"],
    additionalProperties: true
}

const shippoValidateAddRespSchema = {
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
};