<<<<<<< HEAD
import { v4 as uuidV4 } from "uuid";
=======
import { uuid } from 'uuidv4';
>>>>>>> Create item.js

const shippoAddressFrom  = {
    name: "Shawn Ippotle",
    street1: "215 Clayton St.",
    city: "San Francisco",
    state: "CA",
    zip: "94117",
    country: "US"
};

const shippoAddressTo = {
    name: "Mr Hippo",
    street1: "Broadway 1",
    city: "New York",
    state: "NY",
    zip: "10007",
    country: "US"
};

const shippoParcel = {
    length: "5",
    width: "5",
    height: "5",
    distance_unit: "in",
    weight: "2",
    mass_unit: "lb"
};

const shippoTransaction = {
    shipment: {
        address_to: shippoAddressTo,
        address_from: shippoAddressFrom,
        parcels: [shippoParcel]
      },
    carrier_account: "",
    servicelevel_token: "fedex_ground"
}

const shippoAddress = {
<<<<<<< HEAD
    contact_name:"Shawn Ippotle",
    company_name:"Shippo",
=======
    name:"Shawn Ippotle",
    company:"Shippo",
>>>>>>> Create item.js
    street1:"215 Clayton St.",
    city:"San Francisco",
    state:"CA",
    zip:"94117",
    country:"US", // iso2 country code
    phone:"+1 555 341 9393",
    email:"shippotle@goshippo.com"
}

const shippoShipment = {
    address_from: shippoAddressFrom,
    address_to: shippoAddressTo,
<<<<<<< HEAD
    parcels: [shippoParcel],
    async: true
}

const shippoShipmentTesting = {
    shipTo: {
        contactName: "Mr Hippo",
        street1: "Broadway 1",
        city: "New York",
        state: "NY",
        zip: "10007",
        country: "US",
        phone: "4151234567",
        email: "mrhippo@goshippo.com"
      },
    shipFrom: {
        contactName: "Shawn Ippotle",
        street1: "215 Clayton St.",
        city: "San Francisco",
        state: "CA",
        zip: "94117",
        country: "US",
        phone: "4151234565",
        email: "mrhippo2@goshippo.com"
    },
    parcels: [
        {
            length: "5",
            width: "5",
            height: "5",
            distanceUnit: "in",
            weight:{
                unit: "kg",
                value: 2
            },
            massUnit: "lb"
        }
    ]
}

const shippoCarrierAccount = {
    carrier:"fedex", 
    account_id: uuidV4(), 
=======
    parcels: shippoParcel,
    async: true
}

const shippoCarrierAccount = {
    carrier:"fedex", 
    account_id: uuid(), 
>>>>>>> Create item.js
    parameters:{ "meter": "789987" },
    active: true,
    test:true
}

const shippoManifest = {
    carrier_account: "b741b99f95e841639b54272834bc478c",
    shipment_date: "2014-05-16T23:59:59Z",
    transactions: [
        "64bba01845ef40d29374032599f22588",
        "c169aa586a844cc49da00d0272b590e1"
    ]
}

<<<<<<< HEAD
const shippoLabelCreation = {
    shipment: {
        shipTo: {
          contactName: "Mr Hippo",
          street1: "Broadway 1",
          city: "New York",
          state: "NY",
          zip: "10007",
          country: "US",
          companyName: "Shippo",
          email: "shippotle@goshippo.com",
          isResidential: false,
          phone: "+1 555 341 9393"
       },
        shipFrom: {
          contactName: "Shawn Ippotle",
          street1: "215 Clayton St.",
          city: "San Francisco",
          state: "CA",
          zip: "94117",
          country: "US",
          companyName: "Shippod",
          email: "shippotld@goshippo.com",
          isResidential: false,
          phone: "+1 555 341 9394"
        },
        parcels: [
          {
            length: "5",
            width: "5",
            height: "5",
            distanceUnit: "in",
            weight:{
              unit: "kg",
              value: 2
            },
            massUnit: "lb"
          }
        ]
    },
    shipperAccount: {
        id: "ac2f2e4c2d76445589bba81599dd0eb8"
    },
    serviceToken: "usps_priority"
}

=======
>>>>>>> Create item.js
export { 
    shippoAddress,
    shippoTransaction,
    shippoParcel,
    shippoAddressFrom,
    shippoAddressTo,
    shippoShipment,
    shippoCarrierAccount,
    shippoManifest,
<<<<<<< HEAD
    shippoShipmentTesting,
    shippoLabelCreation
=======
>>>>>>> Create item.js
}