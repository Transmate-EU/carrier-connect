import shippoApi from 'shippo';
import dotenv from 'dotenv'

dotenv.config()

const postmenURL = process.env.NODE_ENV === "testing" ? process.env.POSTMEN_SANDBOX_URL : process.env.POSTMEN_PROD_URL;
const shippoApiKey = process.env.NODE_ENV === "testing" ? process.env.SHIPPO_TEST_API_KEY : process.env.SHIPPO_PROD_API_KEY;
const postmentApiKey = process.env.NODE_ENV === "testing" ? process.env.POSTMENT_TEST_API_KEY : process.env.POSTMENT_PROD_API_KEY
const afterShipApiKey = process.env.NODE_ENV === "testing" ? process.env.AFTER_SHIP_TEST_API_KEY : process.env.AFTER_SHIP_PROD_API_KEY

const shippo  = shippoApi(shippoApiKey);

const postmentCredentialHeaders = {
    headers:  {
        'content-type': 'application/json',
        'postmen-api-key': postmentApiKey
    } 
}

const afterShipHeaders = {
    headers: {
        'Content-Type': 'application/json',
        'aftership-api-key': afterShipApiKey
    }
}

const shippoCredentialHeaders = {
    headers: {
        Authorization: `ShippoToken ${shippoApiKey}`
    }
}
 
export { 
    shippo,
    postmenURL,
    postmentApiKey,
    afterShipHeaders,
    postmentCredentialHeaders,
    shippoCredentialHeaders,
};