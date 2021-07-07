import env from "../../.env.json";
import { shipmentTesting } from "../../data/data";

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

const returnShipmentMutationString = (service, shipment) => {
  const shipmentMutation = `
    mutation {
      createLabel(type:"${service}", shipment: {
        shipment: {
          shipTo: {
            contactName: "Shawn Ippotle",
            street1: "${shipment.shipment.shipTo.street1}",
            city: "${shipment.shipment.shipTo.city}",
            state: "${shipment.shipment.shipTo.state}",
            phone: "${shipment.shipment.shipTo.phone}",
            email: "${shipment.shipment.shipTo.email}",
            postalCode: "${shipment.shipment.shipTo.postalCode}",
            countryCode: "${shipment.shipment.shipTo.countryCode}",
            companyName: "SandTown",
            
          },
          shipFrom: {
            contactName: "Mr Hippo",
            street1: "${shipment.shipment.shipFrom.street1}",
            city: "${shipment.shipment.shipFrom.city}",
            state: "${shipment.shipment.shipFrom.state}",
            phone: "${shipment.shipment.shipFrom.phone}",
            email: "${shipment.shipment.shipFrom.email}",
            postalCode: "${shipment.shipment.shipFrom.postalCode}",
            countryCode: "${shipment.shipment.shipFrom.countryCode}",
            companyName: "SandDowny",
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
        shipmentDate: "${shipment.shipmentDate.toString()}",
        getLabel: ${shipment.getLabel},
        serviceType: "${shipment.serviceType}"
      }) {
        id
        labelUrl
        trackingNumbers
        createdAt
        status
      }
    }
  `;

  return shipmentMutation;
};
export { envFile, returnShipmentMutationString };
