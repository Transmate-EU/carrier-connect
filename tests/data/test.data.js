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

export { envFile };
