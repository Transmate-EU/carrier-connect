import env from "../../.env.json";

const envFile = {
  SANDBOX: true,
  NODE_ENV: env.NODE_ENV,
  POSTMEN_SANDBOX_URL: env.POSTMEN_SANDBOX_URL,
  POSTMEN_TEST_API_KEY: env.POSTMEN_TEST_API_KEY,
  SHIPPO_TEST_API_KEY: env.SHIPPO_TEST_API_KEY,
  POSTMEN_PROD_URL: env.POSTMEN_PROD_URL,
  POSTMEN_PROD_API_KEY: env.POSTMEN_PROD_API_KEY,
  SHIPPO_URL: env.SHIPPO_URL,
  SHIPPO_PROD_API_KEY: env.SHIPPO_PROD_API_KEY,
  AFTER_SHIP_TEST_API_KEY: env.AFTER_SHIP_TEST_API_KEY,
  AFTER_SHIP_PROD_API_KEY: env.AFTER_SHIP_PROD_API_KEY,
  AFTER_SHIP_URL: env.AFTER_SHIP_URL,
  SHIPPO_TEST_SHIPPER_ACCOUNT: env.SHIPPO_TEST_SHIPPER_ACCOUNT,
  SHIPPER_ACCOUNT_ID: env.SHIPPER_ACCOUNT_ID,
  SHIPPER_ACCOUNT_USERNAME: env.SHIPPER_ACCOUNT_USERNAME,
  SHIPPER_ACCOUNT_PASSWORD: env.SHIPPER_ACCOUNT_PASSWORD,
  SHIPPER_ACCOUNT_ACC_NUMBER: env.SHIPPER_ACCOUNT_ACC_NUMBER,
  SHIPPER_MANIFEST_TEST_ID: env.SHIPPER_MANIFEST_TEST_ID
};

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
  timeStamp: new Date("2021-06-11 14:00")
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
        height: 9,
        depth: 40
      },
      weight: {
        value: 2
      },
      massUnit: "SU"
    }
  ],
  paymentInfo: "DDP",
  content: "NON_DOCUMENTS"
};

export { ratesObject, shipmentObject, envFile };
