import dotenv from 'dotenv';

dotenv.config();

const envFile = {
    NODE_ENV: process.env.NODE_ENV,
    POSTMEN_SANDBOX_URL: process.env.POSTMEN_SANDBOX_URL,
    POSTMENT_TEST_API_KEY: process.env.POSTMENT_TEST_API_KEY,
    SHIPPO_TEST_API_KEY: process.env.SHIPPO_TEST_API_KEY,
    POSTMEN_PROD_URL: process.env.POSTMEN_PROD_URL,
    POSTMENT_PROD_API_KEY: process.env.POSTMENT_PROD_API_KEY,
    SHIPPO_URL: process.env.SHIPPO_URL,
    SHIPPO_PROD_API_KEY: process.env.SHIPPO_PROD_API_KEY,
    AFTER_SHIP_TEST_API_KEY: process.env.AFTER_SHIP_TEST_API_KEY,
    AFTER_SHIP_PROD_API_KEY: process.env.AFTER_SHIP_PROD_API_KEY,
    AFTER_SHIP_URL: process.env.AFTER_SHIP_URL,
    SHIPPO_TEST_SHIPPER_ACCOUNT: process.env.SHIPPO_TEST_SHIPPER_ACCOUNT
}

export { envFile };