import { v4 as uuidV4 } from "uuid";

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
    name:"Shawn Ippotle",
    company:"Shippo",
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
    parcels: [shippoParcel],
    async: true
}

const shippoCarrierAccount = {
    carrier:"fedex", 
    account_id: uuidV4(), 
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

export { 
    shippoAddress,
    shippoTransaction,
    shippoParcel,
    shippoAddressFrom,
    shippoAddressTo,
    shippoShipment,
    shippoCarrierAccount,
    shippoManifest,
}