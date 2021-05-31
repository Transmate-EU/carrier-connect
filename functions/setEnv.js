exports.setEnv = (params = {}) => {
  if (params.SANDBOX || process.env.SANDBOX) {
    process.env.POSTMEN_SANDBOX_URL = params.SANDBOX || process.env.SANDBOX;
  }
  if (params.POSTMEN_SANDBOX_URL || process.env.POSTMEN_SANDBOX_URL) {
    process.env.POSTMEN_SANDBOX_URL =
      params.POSTMEN_SANDBOX_URL || process.env.POSTMEN_SANDBOX_URL;
  }

  if (params.POSTMEN_TEST_API_KEY || process.env.POSTMEN_TEST_API_KEY) {
    process.env.POSTMEN_TEST_API_KEY =
      params.POSTMEN_TEST_API_KEY || process.env.POSTMEN_TEST_API_KEY;
  }

  if (params.SHIPPO_TEST_API_KEY || process.env.SHIPPO_TEST_API_KEY) {
    process.env.SHIPPO_TEST_API_KEY =
      params.SHIPPO_TEST_API_KEY || process.env.SHIPPO_TEST_API_KEY;
  }

  if (params.POSTMEN_PROD_URL || process.env.POSTMEN_PROD_URL) {
    process.env.POSTMEN_PROD_URL =
      params.POSTMEN_PROD_URL || process.env.POSTMEN_PROD_URL;
  }

  if (params.POSTMENT_PROD_API_KEY || process.env.POSTMENT_PROD_API_KEY) {
    process.env.POSTMENT_PROD_API_KEY =
      params.POSTMENT_PROD_API_KEY || process.env.POSTMENT_PROD_API_KEY;
  }

  if (params.SHIPPO_URL || process.env.SHIPPO_URL) {
    process.env.SHIPPO_URL = params.SHIPPO_URL || process.env.SHIPPO_URL;
  }

  if (params.SHIPPO_PROD_API_KEY || process.env.SHIPPO_PROD_API_KEY) {
    process.env.SHIPPO_PROD_API_KEY =
      params.SHIPPO_PROD_API_KEY || process.env.SHIPPO_PROD_API_KEY;
  }

  if (params.AFTER_SHIP_TEST_API_KEY || process.env.AFTER_SHIP_TEST_API_KEY) {
    process.env.AFTER_SHIP_TEST_API_KEY =
      params.AFTER_SHIP_TEST_API_KEY || process.env.AFTER_SHIP_TEST_API_KEY;
  }

  if (params.AFTER_SHIP_PROD_API_KEY || process.env.AFTER_SHIP_PROD_API_KEY) {
    process.env.AFTER_SHIP_PROD_API_KEY =
      params.AFTER_SHIP_PROD_API_KEY || process.env.AFTER_SHIP_PROD_API_KEY;
  }

  if (params.AFTER_SHIP_URL || process.env.AFTER_SHIP_URL) {
    process.env.AFTER_SHIP_URL =
      params.AFTER_SHIP_URL || process.env.AFTER_SHIP_URL;
  }

  if (
    params.SHIPPO_TEST_SHIPPER_ACCOUNT ||
    process.env.SHIPPO_TEST_SHIPPER_ACCOUNT
  ) {
    process.env.SHIPPO_TEST_SHIPPER_ACCOUNT =
      params.SHIPPO_TEST_SHIPPER_ACCOUNT ||
      process.env.SHIPPO_TEST_SHIPPER_ACCOUNT;
  }
};
