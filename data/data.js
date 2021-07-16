import moment from "moment";

const today = new Date();
const tomorrow = new Date(today);
const tomorrowsDayOfTheWeek = moment(tomorrow).format("dddd");

const endOfWeekDays = ["Thursday", "Friday", "Saturday", "Sunday"];

if (endOfWeekDays.includes(tomorrowsDayOfTheWeek)) {
  tomorrow.setDate(tomorrow.getDate() + 4);
}

if (!endOfWeekDays.includes(tomorrowsDayOfTheWeek)) {
  tomorrow.setDate(tomorrow.getDate() + 2);
}

tomorrow.setHours(12, 0, 0, 0);

const shipmentAddress = {
  contactName: "testing",
  street1: "4901 N New Hope Rd Apt C1",
  city: "Raleigh",
  state: "NC",
  postalCode: "27604",
  countryCode: "US",
  type: "business",
  phone: "17578976058",
  email: "testing@gmail.com"
};

const shipmentTesting = {
  shipment: {
    shipTo: {
      contactName: "Mr Hippo",
      street1: "Broadway 1",
      city: "New York",
      state: "NY",
      phone: "4151234567",
      email: "mrhippo@goshippo.com",
      postalCode: "10007",
      companyName: "Sanditon",
      countryCode: "US"
    },
    shipFrom: {
      contactName: "Shawn Ippotle",
      street1: "215 Clayton St..",
      city: "San Francisco",
      state: "CA",
      phone: "4151234565",
      email: "mrhippo2@goshippo.com",
      postalCode: "94117",
      companyName: "SandTown",
      countryCode: "US"
    },
    parcels: [
      {
        description: "Food Bar",
        length: 5,
        width: 5,
        height: 5,
        distanceUnit: "in",
        boxType: "custom",
        weight: {
          unit: "kg",
          value: 2
        },
        dimension: {
          length: 13,
          width: 12,
          height: 9,
          depth: 40,
          unit: "cm"
        },
        massUnit: "lb",
        items: [
          {
            description: "Food Bar",
            originCountry: "CZ",
            quantity: 2,
            price: {
              amount: 3,
              currency: "EUR"
            },
            weight: {
              value: 0.6,
              unit: "kg"
            },
            sku: "imac2014"
          }
        ]
      }
    ]
  },
  shipmentDate: tomorrow,
  getLabel: false,
  serviceType: "dhl"
};

const labelTesting = {
  serviceType: "fedex_international_priority",
  shipment: shipmentTesting.shipment
};

const shipmentManifest = {
  shipperAccount: {
    id: "3ba41ff5-59a7-4ff0-8333-64a4375c7f21"
  }
};

export { labelTesting, shipmentTesting, shipmentAddress, shipmentManifest };
