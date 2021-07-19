import env from "../../.env.json";
import gqlast from "../../utils/gqlast";

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

const returnShipmentMutation = (service, shipment) => {
  const shipmentMutation = gqlast`
    mutation {
      createLabel(type: ${service}, shipment: {
        shipment: ${shipment.shipment},
        shipmentDate: ${shipment.shipmentDate.toString()},
        getLabel: ${shipment.getLabel},
        serviceType: ${shipment.serviceType}
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

const returnCreateShipmentMutation = (service, shipment) => {
  const shipmentMutation = gqlast`
    mutation {
      createShipment(type: ${service}, shipment: {
        shipment: ${shipment.shipment},
        shipmentDate: ${shipment.shipmentDate.toString()},
        getLabel: ${shipment.getLabel},
        serviceType: ${shipment.serviceType}
      }) {
        id
        shipmentDate
        addressReturnId 
        label {
          id
        }
      }
    }
  `;

  return shipmentMutation;
};

const returnRatesQuery = (service, shipment) => {
  const query = gqlast`
    {
      rates(
        type: ${service},
        shipment: {
          shipment: ${shipment.shipment},
          shipmentDate: ${shipment.shipmentDate.toString()},
          getLabel: ${shipment.getLabel},
          serviceType: ${shipment.serviceType}
      }) {
        id
        status
        totalCharge {
          amount
	        currency
        }
        deliveryDate
        serviceType
      }
    }
  `;
  return query;
};

const returnCancelLabelMutation = (service, labelId) => {
  const query = gqlast`
    mutation {
      cancelOrDeleteLabel(type: ${service}, labelId: ${labelId}) {
        id
        status
        createdAt
        updatedAt
      }
    }
  `;
  return query;
};

const returnCreateManifestMutation = (service, manifest) => {
  const query = gqlast`
  mutation {
    createManifest(type: ${service}, manifest: {
      labelIds: ${manifest.labelIds},
      shipperManifestAccountId: ${manifest.shipperManifestAccountId},
      shipmentDate: ${manifest.shipmentDate},
      shipFromId: ${manifest.shipFromId}
    }) {
      id
      status
      createdAt
      updatedAt
    }
  }
`;
  return query;
};

const returnGetManifestQuery = (service, manifestId) => {
  const query = gqlast`
  query {
    manifest(type: ${service}, manifestId: ${manifestId}) {
      id
      status
      createdAt
      updatedAt
    }
  }
`;
  return query;
};

const returnGetTrackingQuery = (service, tracking) => {
  const query = gqlast`
  query {
    trackingStatus(type: ${service}, tracking: ${tracking}) {
      shipmentWeight
      shipmentWeightUnit
      shipmentPackageCount
      messageReference
    }
  }
`;
  return query;
};

export {
  envFile,
  returnShipmentMutation,
  returnRatesQuery,
  returnCancelLabelMutation,
  returnCreateManifestMutation,
  returnGetManifestQuery,
  returnCreateShipmentMutation,
  returnGetTrackingQuery
};
