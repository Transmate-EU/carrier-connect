import Ajv from "ajv";
import ajvErrors from "ajv-errors";

const ajv = new Ajv({ allErrors: true });
const debug = require("debug")("schema");

ajvErrors(ajv);

const validateSchema = (object, schema) => {
  const validate = ajv.compile(schema);
  const valid = validate(object);

  if (!valid) {
    debug(
      "ERROR validation %o, schema %o, errors %o",
      object,
      schema,
      validate.errors
    );
    return validate.errors;
  }

  return null;
};

const shipmentAddressSchema = {
  type: "object",
  properties: {
    contactName: { type: "string", minLength: 2 },
    companyName: { type: "string" },
    street1: { type: "string" },
    city: {
      type: "string",
      minLength: 2,
      errorMessage: "City must not have less than two characters"
    },
    state: {
      type: "string",
      minLength: 2,
      errorMessage: "State must not have less than two characters"
    },
    postalCode: {
      type: "string",
      minLength: 4,
      errorMessage:
        "Must provide a valid postal code and it should not be less than 4 characters"
    },
    countryCode: {
      type: "string",
      maxLength: 2,
      minLength: 2,
      errorMessage: "Must provide a valid country code e.g AT"
    },
    type: { type: "string" },
    phone: { type: "string", minLength: 10 },
    email: {
      type: "string",
      pattern: "^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$",
      errorMessage: "Must provide a valid email address"
    }
  },
  required: [
    "contactName",
    "street1",
    "city",
    "state",
    "postalCode",
    "countryCode",
    "phone",
    "email"
  ],
  additionalProperties: false
};

const weightSchema = {
  type: "object",
  properties: {
    unit: { type: "string", maxLength: 2, minLength: 2 },
    value: { type: "number" }
  },
  required: ["unit", "value"],
  additionalProperties: false
};

const parcelItemsSchema = {
  type: "array",
  minItems: 1,
  errorMessage: "Items in parcels should not be fewer than 1",
  items: {
    type: "object",
    properties: {
      description: { type: "string" },
      originCountry: { type: "string" },
      quantity: { type: "number" },
      sku: { type: "string" },
      weight: weightSchema,
      price: {
        type: "object",
        properties: {
          amount: { type: "number" },
          currency: { type: "string" }
        },
        required: ["amount", "currency"],
        additionalProperties: false
      }
    },
    required: [
      "description",
      "originCountry",
      "quantity",
      "sku",
      "weight",
      "price"
    ],
    additionalProperties: false
  }
};

const parcelSschema = {
  type: "array",
  minItems: 1,
  items: {
    type: "object",
    properties: {
      description: { type: "string" },
      length: { type: "number" },
      width: { type: "number" },
      height: { type: "number" },
      distanceUnit: { type: "string" },
      boxType: { type: "string" },
      weight: weightSchema,
      dimension: {
        type: "object",
        properties: {
          unit: { type: "string", maxLength: 2 },
          length: { type: "number" },
          width: { type: "number" },
          height: { type: "number" },
          depth: { type: "number" }
        },
        required: ["unit", "length", "width", "depth", "height"],
        additionalProperties: false
      },
      items: parcelItemsSchema,
      massUnit: { type: "string" }
    },
    required: [
      "description",
      "length",
      "width",
      "height",
      "distanceUnit",
      "boxType",
      "weight",
      "dimension",
      "items",
      "massUnit"
    ],
    additionalProperties: false
  }
};

const shipmentSchema = {
  type: "object",
  properties: {
    shipment: {
      type: "object",
      properties: {
        shipTo: shipmentAddressSchema,
        shipFrom: shipmentAddressSchema,
        parcels: parcelSschema
      },
      errorMessage: {
        type: "shipment is a required property"
      },
      required: ["shipTo", "shipFrom", "parcels"],
      additionalProperties: false
    },
    shipmentDate: { type: "object" },
    getLabel: { type: "boolean" },
    serviceType: {
      type: "string",
      errorMessage: "service type is required property"
    },
    shipperAccount: { type: "string" }
  },
  required: ["shipment", "getLabel", "serviceType", "shipmentDate"],
  additionalProperties: false
};

const cancelLabel = {
  type: "object",
  properties: {
    labelId: { type: "string" }
  },
  required: ["labelId"],
  additionalProperties: false
};

const manifestSchema = {
  type: "object",
  properties: {
    shipperManifestAccountId: { type: "string" },
    labelIds: { type: "array" },
    shipFromId: { type: "string" },
    shipmentDate: { type: "string" }
  },
  required: ["shipperManifestAccountId", "labelIds"],
  additionalProperties: false
};

export {
  ajv,
  validateSchema,
  shipmentSchema,
  shipmentAddressSchema,
  manifestSchema,
  cancelLabel
};
