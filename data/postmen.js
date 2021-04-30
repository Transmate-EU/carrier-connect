import { uuid } from "uuidv4"

const postmenShipperAccount = {
    slug: "dhl",
    description: "My Shipper Account",
    timezone: "Asia/Hong_Kong",
    credentials: {
        account_number: uuid(),
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

export {
    postmenAddress,
    postmanTrackingObj,
    postmenShipperAccount
}