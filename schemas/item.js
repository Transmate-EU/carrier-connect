import SimpleSchema from "simpl-schema";
import {
  itemQtyUnits,
  itemWeightUnits,
  itemDimensionUOM
} from "../_utilities/_units.js";

export const ItemSchema = new SimpleSchema({
  shipmentId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },

  // Import
  edi: {
    optional: true,
    type: new SimpleSchema({
      error: {
        optional: true,
        type: new SimpleSchema({
          message: {
            optional: true,
            type: String
          },
          fields: {
            type: Array,
            optional: true
          },
          "fields.$": {
            type: new SimpleSchema({
              name: {
                type: String
              },
              type: {
                type: String,
                allowedValues: ["required", "invalid"]
              },
              value: {
                type: String,
                optional: true
              }
            })
          }
        })
      }
    })
  },

  // Optional data
  number: {
    type: String,
    optional: true // especially useful for imports
  },
  description: {
    type: String,
    optional: true
  },
  quantity: { type: Number },
  quantity_unit: {
    type: String,
    allowedValues: itemQtyUnits
  },
  DG: {
    type: Boolean,
    optional: true
  },
  DGClassType: {
    type: String,
    optional: true // TODO change this in UI!!!
  },
  classType: {
    type: SimpleSchema.Integer,
    optional: true
  },
  commodity: {
    type: String,
    optional: true
  },
  reference: {
    type: Object,
    optional: true
  },
  "reference.order": {
    type: String,
    optional: true
  },
  "reference.delivery": {
    type: String,
    optional: true
  },
  material: {
    type: Object,
    optional: true
  },
  "material.id": {
    type: String,
    optional: true
  },
  "material.description": {
    type: String,
    optional: true
  },

  // weight
  weight_net: {
    type: Number,
    optional: true
  },
  weight_gross: {
    type: Number,
    optional: true
  },
  weight_unit: {
    type: String,
    optional: true,
    allowedValues: itemWeightUnits
  },

  // dimensions
  dimensions: {
    optional: true,
    type: new SimpleSchema({
      length: {
        type: Number,
        min: 0,
        optional: true
      },
      width: {
        type: Number,
        min: 0,
        optional: true
      },
      height: {
        type: Number,
        min: 0,
        optional: true
      },
      uom: {
        type: String,
        optional: true,
        allowedValues: itemDimensionUOM
      }
    })
  },
  volume: {
    type: new SimpleSchema({
      kg: {
        type: Number,
        min: 0,
        defaultValue: 0
      },
      lm: {
        type: Number,
        min: 0,
        defaultValue: 0
      },
      m3: {
        type: Number,
        min: 0,
        defaultValue: 0
      },
      l: {
        type: Number,
        min: 0,
        defaultValue: 0
      },
      pal: {
        type: Number,
        min: 0,
        defaultValue: 0
      }
    })
  },

  // temperature
  temperature: {
    type: "Object",
    optional: true
  },
  "temperature.condition": {
    type: String, // e.g.: "4-8 degrees C"
    optional: true
  },
  "temperature.range": {
    optional: true,
    type: new SimpleSchema({
      from: {
        type: Number
      },
      to: {
        type: Number
      },
      unit: {
        type: String,
        defaultValue: "C"
      }
    })
  },

  // Packaging
  packaging: {
    type: Object,
    optional: true
  },
  "packaging.quantity": {
    type: SimpleSchema.Integer,
    optional: true
  },
  "packaging.type": {
    type: String,
    optional: true
  },
  "packaging.returnable": {
    type: Boolean,
    optional: true
  }
});
