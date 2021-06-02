import Call from "./controller/shipment";

const ratesObject = {
  shipFrom: {
    street1: "1-16-24, Minami-gyotoku",
    city: "QINGDAO SHI",
    postalCode: "272-0138",
    countryCode: "JP"
  },
  shipTo: {
    street1: "63 RENMIN LU, QINGDAO SHI",
    city: "QINGDAO SHI",
    postalCode: "266033",
    countryCode: "CN"
  },
  parcels: [
    {
      dimension: {
        length: 13,
        width: 12,
        height: 9
      },
      weight: {
        value: 2
      },
      massUnit: "SU"
    }
  ],
  content: "NON_DOCUMENTS",
  declaredValue: 200,
  declaredValueCurrecyCode: "USD",
  paymentInfo: "DDP",
  shipperAccount: {
    username: "ESSAustria",
    password: "I@6wO#4pX!1g",
    accountNumber: 178472126
  }
};

const shipmentObject = {
  dropOffType: "REQUEST_COURIER",
  serviceType: "P",
  currency: "EUR",
  timeStamp: new Date("2021-06-11 14:00"),
  pickupLocationCloseTime: "15:59",
  pickupLocation: "west wing 3rd Floor",
  shipFrom: {
    contactName: "John Smith",
    companyName: "DHL",
    email: "John.Smith@dhl.com",
    street1: "1-16-24, Minami-gyotoku",
    city: "QINGDAO SHI",
    postalCode: "1100",
    countryCode: "AT",
    phone: "003932423423"
  },
  internationalDetail: {
    commodities: {
      numberOfPieces: 1,
      description: "ppps sd",
      countryOfManufacture: "CZ",
      quantity: 1,
      unitPrice: 10,
      customsValue: 1
    },
    content: "NON_DOCUMENTS"
  },
  shipTo: {
    contactName: "Jane Smith",
    companyName: "Deutsche Post DHL",
    email: "Jane.Smith@dhl.de",
    street1: "63 RENMIN LU, QINGDAO SHI",
    city: "Firenze",
    postalCode: "50127",
    countryCode: "IT",
    phone: "004922832432423"
  },
  parcels: [
    {
      dimension: {
        length: 13,
        width: 12,
        height: 9
      },
      weight: {
        value: 2
      },
      massUnit: "SU"
    }
  ],
  paymentInfo: "DDP",
  content: "NON_DOCUMENTS",
  shipperAccount: {
    username: "ESSAustria",
    password: "I@6wO#4pX!1g",
    accountNumber: 178472126
  }
};

const testFunction = async () => {
  try {
    // const data = await new Call("dhl").getRates(ratesObject);
    const data = await new Call("dhl").createTracking({
      trackingNumber: 5318580750,
      trackingSlug: "",
      shipperAccount: {
        username: "ESSAustria",
        password: "I@6wO#4pX!1g",
        accountNumber: 178472126
      }
    });
    console.log("data", data);
  } catch (error) {
    console.log("error", error);
  }
};

testFunction();
