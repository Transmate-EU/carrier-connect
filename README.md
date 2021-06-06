# Carrier Connect

This is guide on how to consume and use this API service to make Shipments, get rates, labels, tracking and manifests.

## Create shipment, get rates and a label

When a cloud function is called with the `createshipment` type(`dhl` or `postmen` or `shippo`) and a shipment body(to be shown below), we expect to get back a shipment id, rates and a label. This is a sample request for creation of a shipment
on either of the three services dhl, shippo or postmen.

```
    const shipmentTesting = {
        shipment: {
            shipTo: {
                contactName: "Mr Hippo",
                street1: "Broadway 1",
                city: "New York",
                state: "NY",
                phone: "4151234567",
                email: "mrhippo@goshippo.com",
                postalCode: "10007",
                companyName: "Sanditon",
                countryCode: "US"
            },
            shipFrom: {
                contactName: "Shawn Ippotle",
                street1: "215 Clayton St..",
                city: "San Francisco",
                state: "CA",
                phone: "4151234565",
                email: "mrhippo2@goshippo.com",
                postalCode: "94117",
                companyName: "SandTown",
                countryCode: "US"
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
        shipmentDate: new Date("2021-06-16 14:00"),
        getLabel: true,
        serviceType: "dhl"
    };
```

This generates an example response;

```
    {
        data: {
            shipment: {
                id: "",
                createdAt: "",
                rates: [
                    {
                        id: "12323242324",
                        status: "calculated",
                        serviceType: "fedex",
                        deliveryDate: "2021-06-16 14:00",
                        totalCharge: {
                            amount: 123,
                            currency: "EUR"
                        },
                    }
                ]
                label: {
                    id: "s2343s2w23",
                    status: "created",
                    labelUrl: "",
                    createdAt: "2021-06-16 14:00",
                    trackingNumbers: [1232424242, 12131424234]
                }
                trackingNumber: ""
            }
        }
    }
```

