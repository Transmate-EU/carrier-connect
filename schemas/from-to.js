import SimpleSchema from "simpl-schema";

import { AddressSchema } from "../collections/address.js";

// used in Stage[from/to]:<> || Shipment[pickup/delivery].location: <>
export const FromToSchema = new SimpleSchema({
  latLng: {
    optional: true,
    type: new SimpleSchema({
      lat: {
        type: Number
      },
      lng: {
        type: Number
      }
    })
  },
  countryCode: {
    type: String,
    min: 2,
    max: 2
  },
  isValidated: {
    optional: true,
    type: Boolean,
    defaultValue: true
  },

  // There's four types of shipment from/to locations:
  // 1) shortCode — just zipcode and country code
  // 2) address — full address, linked to record in `addresses` collection
  // 3) locode — country code + offical location code, no zipcode/address info
  // 4) country - just country code; only used in price list from location
  zipCode: {
    type: String,
    optional: true // locode will not have a zipcode
  },
  timeZone: {
    type: String,
    optional: true // locode will not have a zipcode
  },
  // We store the addresses in a seperate collection, to make it easier to check
  // for uniqueness.
  addressId: {
    optional: true,
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
  locode: {
    optional: true,
    type: new SimpleSchema({
      id: {
        type: String,
        regEx: SimpleSchema.RegEx.LocodeId
      },
      code: {
        type: String,
        optional: true
      },
      function: {
        type: String,
        optional: true
      }
    })
  },

  // The address name is copied from the address collection upon creation, to
  // make it easier to display (as an address can have different names for
  // different accounts)
  name: {
    type: String,
    optional: true // for imported shortcodes
  },

  // Copy all the address information, in case we will enable modifying the
  // addresses collection in the future
  address: {
    optional: true,
    type: AddressSchema.pick("street", "number", "city", "state")
  }
});

// used in methods stageAddrUpdate, shipment.create.UI for location use
export const LocationSchema = new SimpleSchema({
  type: {
    type: String,
    allowedValues: ["address", "location"]
  },
  id: {
    type: String
  }
});
