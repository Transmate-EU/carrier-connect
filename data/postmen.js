import { v4 as uuidV4 } from "uuid";

const postmenShipperAccount = {
    slug: "dhl",
    description: "My Shipper Account",
    timezone: "Asia/Hong_Kong",
    credentials: {
        account_number: uuidV4(),
        password: "mannnurru",
        site_id: "none"
    },
    address: {
      country: "HKG",
      contact_name: "Sir Foo",
      phone: "11111111",
      fax: "+1 206-654-3100",
      email: "foo@foo.com",
      company_name: "Foo Store",
      street1: "Workshop A, 10/F, Wah Shing Industrial Building",
      street2: "18 Cheung Shun Street, Lai Chi Kok",
      city: "Lai Chi Kok",
      type: "business",
      postal_code: null,
      state: null,
      street3: null,
      tax_id: null
    }
}

const postmenAddress = {
    contact_name: "testing",
    street1: "4901 N New Hope Rd Apt C1",
    city: "Raleigh",
    state: "NC",
    postal_code: "27604",
    country: "USA",
    type: "business",
    phone: "17578976058",
    email: "testing@gmail.com"
}

const postmanTrackingObj = {
    slug: "usps",
    tracking_number: "6123456769",
    title: "Title Name",
    smses: [
        "+18555072509",
        "+18555072501"
    ],
    emails: [
        "email@yourdomain.com",
        "another_email@yourdomain.com"
    ],
    order_id: "ID 1234",
    order_id_path: "http://www.aftership.com/order_id=1234",
    custom_fields: {
        "product_name": "iPhone Case",
        "product_price": "USD19.99"
    },
    language: "en",
    order_promised_delivery_date: "2019-05-20",
    delivery_type: "pickup_at_store",
    pickup_location: "Flagship Store",
    pickup_note: "Reach out to our staffs when you arrive our stores for shipment pickup"
}

const postmenCalculateRate = {
    async: false,
	shipper_accounts: [
	    {
	      "id": "6f43fe77-b056-45c3-bce4-9fec4040da0c"
	    }
	],
    shipment: {
        parcels: [
            {
            description: "Food XS",
            box_type: "custom",
            weight: {
                value: 2,
                unit: "kg"
            },
            dimension: {
                width: 20,
                height: 40,
                depth: 40,
                unit: "cm"
            },
            items: [
                {
                description: "Food Bar",
                origin_country: "JPN",
                quantity: 2,
                price: {
                    "amount": 3,
                    "currency": "JPY"
                },
                weight: {
                    "value": 0.6,
                    "unit": "kg"
                },
                sku: "PS4-2015"
                }
            ]
            }
        ],
        ship_from: {
            contact_name: "Yin Ting Wong",
            street1: "Flat A, 29/F, Block 17\nLaguna Verde",
            city: "Hung Hom",
            state: "Kowloon",
            country: "HKG",
            phone: "96679797",
            email: "test@test.test",
            type: "residential"
        },
        ship_to: {
            contact_name: "Mike Carunchia",
            street1: "9504 W Smith ST",
            city: "Yorktown",
            state: "Indiana",
            postal_code: "47396",
            country: "USA",
            phone: "7657168649",
            email: "test@test.test",
            type: "residential"
        }
    }
}

const postmenManifestReq = {
    async: false,
    shipper_account: {
        id: "3ba41ff5-59a7-4ff0-8333-64a4375c7f21"
    }
}

export {
    postmenAddress,
    postmenManifestReq,
    postmanTrackingObj,
    postmenCalculateRate,
    postmenShipperAccount
}