/* eslint-disable consistent-return */
import axios from "axios";
import shippoApi from "shippo";
import {
  getMessageReference,
  getIsoDateTimeGmt,
  rateRequest,
  getIsoDateTime,
  shipmentRequest,
  trackingRequest
} from "dhl-node";
import {
  postmenAddressReqSchema,
  postmenCalculateSchema,
  postmenCreateLabelSchema,
  postmenCreateShipperAccount,
  postmenGetTrackingSchema,
  postmenManifestReqSchema,
  validateSchema,
  shippoCreateShipmentSchema,
  shippoCarrierAccountSchema,
  shippoCreateManifestSchema,
  shippoAddressCreationSchema,
  shippoCreateLabelSchema
} from "../schemas/schemas";

const debug = require("debug")("shipmentController");

const POSTMEN_SANDBOX_URL = "https://sandbox-api.postmen.com/v3";
const POSTMEN_PROD_URL = "https://prod-api.postmen.com/v3";
const SHIPPO_URL = "https://api.goshippo.com/";
const AFTER_SHIP_URL = "https://api.aftership.com/v4";

function errorObj(error) {
  debug("error", error);
  if (Array.isArray(error)) {
    console.log("reached here");
    // validations errors
    return {
      data: {},
      warnings: [],
      errors: error
    };
  }

  if (error.detail) {
    return {
      data: {},
      warnings: [],
      errors: [error.detail]
    };
  }

  if (error.response) {
    return {
      data: {},
      warnings: [],
      errors: [error.response.data]
    };
  }

  return {
    data: {},
    warnings: [],
    errors: [error.message]
  };
}

class Shipment {
  constructor(service, context = process.env || {}) {
    debug("shipment constructor called %o", context);
    debug("SANDBOX? %o ", context.SANDBOX);

    const sandbox = context.SANDBOX === true || context.SANDBOX === "true";
    this.postmenUrl = sandbox ? POSTMEN_SANDBOX_URL : POSTMEN_PROD_URL;

    this.shippoApiKey = sandbox
      ? context.SHIPPO_TEST_API_KEY
      : context.SHIPPO_PROD_API_KEY;
    this.postmentApiKey = sandbox
      ? context.POSTMEN_TEST_API_KEY
      : context.POSTMENT_PROD_API_KEY;
    this.afterShipApiKey = sandbox
      ? context.AFTER_SHIP_TEST_API_KEY
      : context.AFTER_SHIP_PROD_API_KEY;

    this.shippo = this.shippoApiKey ? shippoApi(this.shippoApiKey) : null;
    this.shippoUrl = SHIPPO_URL;
    this.postmentCredentialHeaders = {
      headers: {
        "content-type": "application/json",
        "postmen-api-key": this.postmentApiKey
      }
    };
    this.afterShipUrl = AFTER_SHIP_URL;
    this.afterShipHeaders = {
      headers: {
        "Content-Type": "application/json",
        "aftership-api-key": this.afterShipApiKey
      }
    };

    this.shippoCredentialHeaders = {
      headers: {
        Authorization: `ShippoToken ${this.shippoApiKey}`
      }
    };
    this.service = (service || "").toLowerCase();
    if (!["shippo", "postmen", "dhl"].includes(this.service))
      throw Error("you must select a service (postmen or goshippo)");
    if (this.service === "shippo" && !this.shippo)
      throw Error("check keys for shippo!");

    if (this.service === "postmen" && !this.postmenUrl.length > 5)
      throw Error("check keys for postmen!");
  }

  async createShipment(requestObject) {
    debug(
      "call shipment create  %o , with obj %o",
      this.service,
      requestObject
    );
    /* 
            To create shippo shipment, we need to provide a body
            with the following properties(address_from, address_to,
            parcels)
        */
    try {
      if (this.service === "shippo") {
        const formatedObject = {
          parcels: requestObject.parcels.map(parcel => ({
            width: parcel.width,
            length: parcel.length,
            height: parcel.height,
            mass_unit: parcel.massUnit,
            distance_unit: parcel.distanceUnit,
            weight: parcel.weight.value.toString()
          })),
          address_from: {
            name: requestObject.shipFrom.contactName,
            street1: requestObject.shipFrom.street1,
            city: requestObject.shipFrom.city,
            state: requestObject.shipFrom.state,
            zip: requestObject.shipFrom.zip,
            country: requestObject.shipFrom.country,
            phone: requestObject.shipFrom.phone,
            email: requestObject.shipFrom.email,
            company: requestObject.shipFrom.companyName
          },
          address_to: {
            name: requestObject.shipTo.contactName,
            street1: requestObject.shipTo.street1,
            city: requestObject.shipTo.city,
            state: requestObject.shipTo.state,
            zip: requestObject.shipTo.zip,
            country: requestObject.shipTo.country,
            phone: requestObject.shipTo.phone,
            email: requestObject.shipTo.email,
            company: requestObject.shipFrom.companyName
          }
        };

        const errors = validateSchema(
          formatedObject,
          shippoCreateShipmentSchema
        );

        if (errors) return errorObj(errors);

        const shipment = await this.shippo.shipment.create(formatedObject);
        debug("shippo return %o", shipment);
        return {
          data: {
            shipment: {
              id: shipment.object_id,
              createdAt: shipment.object_created,
              updatedAt: shipment.object_updated,
              objectOwner: shipment.object_owner,
              shipFrom: {
                id: shipment.address_from.object_id,
                isComplete: shipment.address_from.is_complete,
                contactName: shipment.address_from.name,
                street1: shipment.address_from.street1,
                city: shipment.address_from.city,
                state: shipment.address_from.state,
                zip: shipment.address_from.zip,
                country: shipment.address_from.country,
                phone: shipment.address_from.phone,
                email: shipment.address_from.email,
                validationResults: shipment.address_from.validation_results
              },
              shipTo: {
                id: shipment.address_to.object_id,
                isComplete: shipment.address_to.is_complete,
                contactName: shipment.address_to.name,
                street1: shipment.address_to.street1,
                city: shipment.address_to.city,
                state: shipment.address_to.state,
                zip: shipment.address_to.zip,
                country: shipment.address_to.country,
                phone: shipment.address_to.phone,
                email: shipment.address_to.email,
                validationResults: shipment.address_to.validation_results
              },
              addressReturn: {
                id: shipment.address_return.object_id,
                isComplete: shipment.address_return.is_complete,
                contactName: shipment.address_return.name,
                street1: shipment.address_return.street1,
                city: shipment.address_return.city,
                state: shipment.address_return.state,
                zip: shipment.address_return.zip,
                country: shipment.address_return.country,
                phone: shipment.address_return.phone,
                email: shipment.address_return.email,
                validationResults: shipment.address_return.validation_results
              },
              status: shipment.status,
              parcels: shipment.parcels.map(parcel => ({
                id: parcel.object_id,
                length: parcel.length,
                width: parcel.width,
                height: parcel.height,
                distanceUnit: parcel.distance_unit,
                weight: {
                  value: parcel.weight,
                  unit: parcel.mass_unit
                }
              })),
              rates: shipment.rates.map(rate => ({
                id: rate.object_id,

                status: rate.status,
                serviceType: rate.provider,
                serviceName: rate.servicelevel.name,
                serviceToken: rate.servicelevel.token,
                shipperAccount: {
                  id: rate.carrier_account
                },
                createdAt: rate.object_created,
                totalCharge: {
                  amount: rate.amount,
                  currency: rate.currency
                },
                localTotalCharge: {
                  amountLocal: rate.amount_local,
                  currencyLocal: rate.currency_local
                },
                durationTerms: rate.duration_terms,
                updatedAt: rate.object_updated
              }))
            }
          },
          warnings: [],
          errors: []
        };
      }

      if (this.service === "dhl") {
        const formattedObject = {
          RequestedShipment: {
            ShipmentInfo: {
              DropOffType: requestObject.dropOffType,
              ServiceType: requestObject.serviceType,
              Account: requestObject.shipperAccount.accountNumber,
              Currency: requestObject.currency,
              UnitOfMeasurement: requestObject.parcels[0].massUnit,
              PackagesCount: 1,
              LabelType: requestObject.labelType,
              LabelTemplate: requestObject.labelTemplate
            },
            ShipTimestamp: getIsoDateTimeGmt(requestObject.timeStamp),
            PickupLocationCloseTime: requestObject.pickupLocationCloseTime,
            SpecialPickupInstruction: requestObject.specialPickupInstruction,
            PickupLocation: requestObject.pickupLocation,
            PaymentInfo: requestObject.paymentInfo,
            InternationalDetail: {
              Commodities: {
                NumberOfPieces:
                  requestObject.internationalDetail.commodities.numberOfPieces,
                Description:
                  requestObject.internationalDetail.commodities.description,
                CountryOfManufacture:
                  requestObject.internationalDetail.commodities
                    .countryOfManufacture,
                Quantity:
                  requestObject.internationalDetail.commodities.quantity,
                UnitPrice:
                  requestObject.internationalDetail.commodities.unitPrice,
                CustomsValue:
                  requestObject.internationalDetail.commodities.customsValue
              },
              Content: requestObject.internationalDetail.content
            },
            Ship: {
              Shipper: {
                Contact: {
                  PersonName: requestObject.shipFrom.contactName,
                  CompanyName: requestObject.shipFrom.companyName,
                  PhoneNumber: requestObject.shipFrom.phone,
                  EmailAddress: requestObject.shipFrom.email
                },
                Address: {
                  StreetLines: requestObject.shipFrom.street1,
                  City: requestObject.shipFrom.city,
                  PostalCode: requestObject.shipFrom.postalCode,
                  CountryCode: requestObject.shipFrom.countryCode
                }
              },
              Recipient: {
                Contact: {
                  PersonName: requestObject.shipTo.contactName,
                  CompanyName: requestObject.shipTo.companyName,
                  PhoneNumber: requestObject.shipTo.phone,
                  EmailAddress: requestObject.shipTo.email
                },
                Address: {
                  StreetLines: requestObject.shipTo.street1,
                  City: requestObject.shipTo.city,
                  PostalCode: requestObject.shipTo.postalCode,
                  CountryCode: requestObject.shipTo.countryCode
                }
              }
            },
            Packages: {
              RequestedPackages: {
                attributes: {
                  number: 1
                },
                Weight: requestObject.parcels[0].weight.value,
                Dimensions: {
                  Length: requestObject.parcels[0].dimension.length,
                  Width: requestObject.parcels[0].dimension.width,
                  Height: requestObject.parcels[0].dimension.height
                },
                CustomerReferences: "TEST CZ-IT"
              }
            }
          }
        };

        const data = await shipmentRequest(
          requestObject.shipperAccount,
          formattedObject
        );

        if (data.response.Notification.length > 0) {
          return errorObj(data.response.Notification);
        }

        const returnedJSON = JSON.stringify(data.response, null, 4);
        const parsedObject = JSON.parse(returnedJSON);

        return {
          data: {
            shipment: {
              shipmentIdentificationNumber:
                parsedObject.ShipmentIdentificationNumber,
              dispatchConfirmationNumber:
                parsedObject.DispatchConfirmationNumber,
              labelImageFormat: parsedObject.LabelImage.LabelImageFormat,
              graphicImage: parsedObject.LabelImage.GraphicImage,
              trackingNumber:
                parsedObject.PackagesResult.PackageResult.TrackingNumber
            }
          },
          warnings: [],
          errors: []
        };
      }
    } catch (error) {
      return errorObj(error);
    }
  }

  async createCarrierAccount(requestObject) {
    try {
      if (this.service === "shippo") {
        const errors = validateSchema(
          requestObject,
          shippoCarrierAccountSchema
        );

        if (errors) return errorObj(errors);

        const resultObject = await this.shippo.carrieraccount.create(
          requestObject
        );
        return {
          data: resultObject,
          warnings: [],
          errors: []
        };
      }

      if (this.service === "postmen") {
        const errors = validateSchema(
          requestObject,
          postmenCreateShipperAccount
        );

        if (errors) return errorObj(errors);

        const data = await axios({
          method: "post",
          url: `${this.postmenUrl}/shipper-accounts`,
          data: requestObject,
          headers: {
            ...this.postmentCredentialHeaders.headers
          }
        });
        return {
          data: data.data,
          warnings: [],
          errors: []
        };
      }
    } catch (error) {
      return errorObj(error);
    }
  }

  async createManifest(manifest) {
    try {
      if (this.service === "shippo") {
        const formatedManifest = {
          shipment_date: manifest.shipmentDate,
          transactions: manifest.transactions,
          carrier_account: manifest.shipperAccount.id,
          address_from: manifest.shipFromId
        };

        const errors = validateSchema(
          formatedManifest,
          shippoCreateManifestSchema
        );

        if (errors) return errorObj(errors);

        const resultObject = await this.shippo.manifest.create(
          formatedManifest
        );

        return {
          data: {
            status: resultObject.status,
            objectOwner: resultObject.object_owner,
            createdAt: resultObject.object_created,
            updatedAt: resultObject.object_updated,
            shipFromId: resultObject.address_from,
            shipperAccount: {
              id: resultObject.carrier_account
            },
            transactions: resultObject.transactions
          },
          warnings: [],
          errors: []
        };
      }

      if (this.service === "postmen") {
        const formatedManifest = {
          shipper_account: {
            ...manifest.shipperAccount
          }
        };

        const errors = validateSchema(
          formatedManifest,
          postmenManifestReqSchema
        );

        if (errors) return errorObj(errors);

        const data = await axios({
          method: "post",
          url: `${this.postmenUrl}/manifests`,
          data: formatedManifest,
          headers: {
            ...this.postmentCredentialHeaders.headers
          }
        });

        if (data.data.meta.code === 4104 && !data.data.data) {
          return {
            data: {},
            warnings: [],
            errors: [...data.data.meta.details]
          };
        }

        return {
          data: {
            id: data.data.data.id,
            status: data.data.data.status,
            labels: data.data.data.labels,
            files: {
              label: data.data.data?.files?.label,
              invoice: data.data.data?.files?.invoice,
              customsDeclaration: data.data.data?.files?.customs_declaration,
              manifest: {
                paperSize: data.data.data?.files?.manifest?.paper_size,
                url: data.data.data?.files?.manifest?.url,
                fileType: data.data.data?.files?.manifest?.file_type
              }
            },
            updatedAt: data.data.data.updated_at,
            createdAt: data.data.data.created_at
          },
          warnings: [],
          errors: []
        };
      }
    } catch (error) {
      return errorObj(error);
    }
  }

  async getRates(shipment) {
    /* 
            To get shippo rates, we need to first create a shipment see #createShipment
            then we supply a shipment id.
            As for Postmen, we need to supply a body that has(shipper acc, shipment(parcels, 
                ship_from and ship_to)) as seen in the tests.
            a shipper account(can be created) using #createCarrierAccount(postment, requestBody).
        */
    try {
      if (this.service === "shippo") {
        if (!shipment.shipmentId || shipment.shipmentId === "") {
          return {
            data: {},
            warnings: [],
            errors: ["Please provide shipment id"]
          };
        }

        const resultObject = await this.shippo.shipment.rates(
          shipment.shipmentId
        );
        return {
          data: {
            rates: resultObject.results.map(rate => ({
              id: rate.object_id,
              status: rate.status,
              serviceType: rate.provider,
              serviceToken: rate.servicelevel.token,
              serviceName: rate.servicelevel.name,
              shipperAccount: {
                id: rate.carrier_account
              },
              createdAt: rate.object_created,
              totalCharge: {
                amount: rate.amount,
                currency: rate.currency
              },
              localTotalCharge: {
                amountLocal: rate.amount_local,
                currencyLocal: rate.currency_local
              },
              durationTerms: rate.duration_terms,
              updatedAt: rate.object_updated
            }))
          },
          warnings: [],
          errors: []
        };
      }

      if (this.service === "postmen") {
        const formatedShipment = {
          is_document: shipment.isDocument,
          shipment: {
            ship_from: {
              contact_name: shipment.shipment.shipFrom.contactName,
              street1: shipment.shipment.shipFrom.street1,
              city: shipment.shipment.shipFrom.city,
              state: shipment.shipment.shipFrom.state,
              country: shipment.shipment.shipFrom.country,
              phone: shipment.shipment.shipFrom.phone,
              email: shipment.shipment.shipFrom.email,
              postal_code: shipment.shipment.shipFrom.postalCode
            },
            ship_to: {
              contact_name: shipment.shipment.shipTo.contactName,
              street1: shipment.shipment.shipTo.street1,
              city: shipment.shipment.shipTo.city,
              state: shipment.shipment.shipTo.state,
              country: shipment.shipment.shipTo.country,
              phone: shipment.shipment.shipTo.phone,
              email: shipment.shipment.shipTo.email,
              postal_code: shipment.shipment.shipTo.postalCode
            },
            parcels: shipment.shipment.parcels.map(parcel => ({
              box_type: parcel.boxType,
              description: parcel.description,
              weight: parcel.weight,
              dimension: parcel.dimension,
              items: parcel.items.map(item => ({
                description: item.description,
                origin_country: item.originCountry,
                quantity: item.quantity,
                price: item.price,
                weight: item.weight,
                sku: item.sku
              }))
            }))
          },
          shipper_accounts: shipment.shipperAccounts
        };

        const errors = validateSchema(formatedShipment, postmenCalculateSchema);

        if (errors) return errorObj(errors);

        const data = await axios({
          method: "post",
          url: `${this.postmenUrl}/rates`,
          data: formatedShipment,
          headers: {
            ...this.postmentCredentialHeaders.headers
          }
        });

        if (data.data.meta.code === 4104) {
          return {
            data: {},
            warnings: [],
            errors: [...data.data.meta.details]
          };
        }

        return {
          data: {
            rates: data.data.data.rates.map(rate => ({
              id: rate.service_type,
              status: "calculated",
              chargeWeight: {
                ...rate.charge_weight
              },
              serviceName: rate.service_name,
              serviceType: rate.shipper_account.slug,
              serviceToken: rate.service_type,
              totalCharge: {
                ...rate.total_charge
              },
              shipperAccount: {
                id: rate.shipper_account.id
              },
              detailedCharges: [...rate.detailed_charges]
            }))
          },
          warnings: [],
          errors: []
        };
      }

      if (this.service === "dhl") {
        const formattedObject = {
          ClientDetail: {},
          RequestedShipment: {
            DropOffType: "REQUEST_COURIER",
            Ship: {
              Shipper: {
                StreetLines: shipment.shipFrom.street1,
                City: shipment.shipFrom.city,
                PostalCode: shipment.shipFrom.postalCode,
                CountryCode: shipment.shipFrom.countryCode
              },
              Recipient: {
                StreetLines: shipment.shipTo.street1,
                City: shipment.shipTo.city,
                PostalCode: shipment.shipTo.postalCode,
                CountryCode: shipment.shipTo.countryCode
              }
            },
            Packages: {
              RequestedPackages: {
                attributes: {
                  number: 1
                },
                Weight: {
                  Value: shipment.parcels[0].weight.value
                },
                Dimensions: {
                  Length: shipment.parcels[0].dimension.length,
                  Width: shipment.parcels[0].dimension.width,
                  Height: shipment.parcels[0].dimension.height
                }
              }
            },
            ShipTimestamp: getIsoDateTimeGmt(shipment.timeStamp),
            UnitOfMeasurement: shipment.parcels[0].massUnit,
            Content: shipment.content,
            DeclaredValue: shipment.declaredValue,
            DeclaredValueCurrecyCode: shipment.declaredValueCurrecyCode,
            PaymentInfo: shipment.paymentInfo,
            Account: Number(shipment.shipperAccount.accountNumber)
          }
        };

        const data = await rateRequest(
          shipment.shipperAccount,
          formattedObject
        );

        const returnedJSON = JSON.stringify(data.response, null, 4);
        const parsedObject = JSON.parse(returnedJSON);

        if (data.response.Notification) {
          return errorObj(
            data.response.Notification
              ? data.response.Notification
              : parsedObject.Provider.Notification
          );
        }

        return {
          data: {
            rates: parsedObject?.Provider?.Service.map(rate => ({
              serviceName: "dhl",
              totalCharge: {
                amount: rate.TotalNet.Amount,
                currency: rate.TotalNet.Currency
              },
              localTotalCharge: {
                amount: rate.TotalNet.Amount,
                currency: rate.TotalNet.Currency
              },
              deliveryDate: rate.DeliveryTime,
              cutOffTime: rate.CutoffTime
            }))
          },
          warnings: [],
          errors: []
        };
      }
    } catch (error) {
      return errorObj(error);
    }
  }

  async createAddress(address) {
    try {
      if (this.service === "shippo") {
        const formatedAddress = {
          name: address.contactName,
          company: address.companyName,
          street1: address.street1,
          city: address.city,
          state: address.state,
          zip: address.zip,
          country: address.country,
          phone: address.phone,
          email: address.email,
          is_residential: address.is_residential,
          metadata: address.metadata
        };

        const errors = validateSchema(
          formatedAddress,
          shippoAddressCreationSchema
        );

        if (errors) return errorObj(errors);

        const resultObject = await this.shippo.address.create(formatedAddress);

        return {
          data: {
            address: {
              id: resultObject.object_id,
              isComplete: resultObject.is_complete,
              contactName: resultObject.name,
              street1: resultObject.street1,
              city: resultObject.city,
              state: resultObject.state,
              zip: resultObject.zip,
              country: resultObject.country,
              phone: resultObject.phone,
              email: resultObject.email,
              validationResults: resultObject.validation_results
            }
          },
          warnings: [],
          errors: []
        };
      }
    } catch (error) {
      return errorObj(error);
    }
  }

  async validateAddress(address) {
    /* 
            To validate shippo address, we need to first create the address and 
            then verify it and as for postmen, we just provide an address body that has
            {contact_name, street1, city, state, postal_code, country, type, phone, email }
            see this test in the test files
        */
    try {
      if (this.service === "shippo") {
        const resultObject = await this.shippo.address.validate(address.id);
        return {
          data: {
            id: resultObject.object_id,
            isComplete: resultObject.is_complete,
            contactName: resultObject.name,
            street1: resultObject.street1,
            city: resultObject.city,
            state: resultObject.state,
            zip: resultObject.zip,
            country: resultObject.country,
            phone: resultObject.phone,
            email: resultObject.email,
            validationResults: {
              isValid: resultObject.validation_results.is_valid,
              messages: resultObject.validation_results.messages
            }
          },
          warnings: [],
          errors: []
        };
      }

      if (this.service === "postmen") {
        const formatedAddress = {
          country: address.country,
          contact_name: address.contactName,
          phone: address.phone,
          fax: address.fax,
          email: address.email,
          company_name: address.companyName,
          street1: address.street1,
          street2: address.street2,
          street3: address.street3,
          city: address.city,
          state: address.state,
          postal_code: address.postalCode,
          type: address.type,
          tax_id: address.taxId
        };

        const errors = validateSchema(
          { address: formatedAddress },
          postmenAddressReqSchema
        );

        if (errors) return errorObj(errors);

        const data = await axios({
          method: "post",
          url: `${this.postmenUrl}/address-validations`,
          data: { address: formatedAddress },
          headers: {
            ...this.postmentCredentialHeaders.headers
          }
        });

        if (data.data.meta.code === 4104) {
          return {
            data: {},
            warnings: [],
            errors: [...data.data.meta.details]
          };
        }

        return {
          data: {
            id: data.data.data.id,
            address: {
              country: data.data.data.address.country,
              contactName: data.data.data.address.contact_name,
              phone: data.data.data.address.phone,
              fax: data.data.data.address.fax,
              email: data.data.data.address.email,
              companyName: data.data.data.address.company_name,
              street1: data.data.data.address.street1,
              street2: data.data.data.address.street2,
              street3: data.data.data.address.street3,
              city: data.data.data.address.city,
              state: data.data.data.address.state,
              postalCode: data.data.data.address.postal_code,
              type: data.data.data.address.type,
              taxId: data.data.data.address.tax_id
            },
            status: data.data.data.status,
            createdAt: data.data.data.created_at,
            updatedAt: data.data.data.updated_at
          },
          warnings: [],
          errors: []
        };
      }
    } catch (error) {
      return errorObj(error);
    }
  }

  async createLabel(label) {
    try {
      if (this.service === "shippo") {
        const labelFormatedObj = {
          rate: label.rate,
          label_file_type: "PDF"
        };
        const errors = validateSchema(
          labelFormatedObj,
          shippoCreateLabelSchema
        );

        if (errors) return errorObj(errors);

        const data = await axios({
          method: "post",
          url: `${this.shippoUrl}/transactions`,
          data: labelFormatedObj,
          headers: {
            ...this.shippoCredentialHeaders.headers
          }
        });

        const resultObject = data.data;

        return {
          data: {
            id: resultObject.object_id,
            status: resultObject.status,
            objectOwner: resultObject.object_owner,
            createdAt: resultObject.object_created,
            updatedAt: resultObject.object_updated,
            rate: {
              id: resultObject.rate
            },
            trackingStatus: resultObject.tracking_status,
            trackingNumber: resultObject.tracking_number
          },
          warnings: [],
          errors: []
        };
      }

      if (this.service === "postmen") {
        const formatedLabel = {
          is_document: label.isDocument,
          service_type: label.serviceType,
          customs: {
            billing: {
              paid_by: label.customs?.billing?.paidBy
            },
            purpose: label.customs?.purpose
          },
          shipment: {
            ship_from: {
              contact_name: label.shipment.shipFrom.contactName,
              street1: label.shipment.shipFrom.street1,
              city: label.shipment.shipFrom.city,
              state: label.shipment.shipFrom.state,
              country: label.shipment.shipFrom.country,
              phone: label.shipment.shipFrom.phone,
              email: label.shipment.shipFrom.email,
              postal_code: label.shipment.shipFrom.postalCode
            },
            ship_to: {
              contact_name: label.shipment.shipTo.contactName,
              street1: label.shipment.shipTo.street1,
              city: label.shipment.shipTo.city,
              state: label.shipment.shipTo.state,
              country: label.shipment.shipTo.country,
              phone: label.shipment.shipTo.phone,
              email: label.shipment.shipTo.email,
              postal_code: label.shipment.shipTo.postalCode
            },
            parcels: label.shipment.parcels.map(parcel => ({
              box_type: parcel.boxType,
              description: parcel.description,
              weight: parcel.weight,
              dimension: parcel.dimension,
              items: parcel.items.map(item => ({
                description: item.description,
                origin_country: item.originCountry,
                quantity: item.quantity,
                price: item.price,
                weight: item.weight,
                sku: item.sku
              }))
            }))
          },
          shipper_account: label.shipperAccount
        };

        const errors = validateSchema(formatedLabel, postmenCreateLabelSchema);

        if (errors) return errorObj(errors);

        const data = await axios({
          method: "post",
          url: `${this.postmenUrl}/labels`,
          data: formatedLabel,
          headers: {
            ...this.postmentCredentialHeaders.headers
          }
        });

        if (data.data.meta.code === 4104) {
          return {
            data: {},
            warnings: [],
            errors: [...data.data.meta.details]
          };
        }

        return {
          data: {
            id: data.data.data.id,
            status: data.data.data.status,
            trackingNumbers: data.data.data.tracking_numbers,
            labelUrl: data.data.data.files.label.url,
            files: {
              label: {
                paperSize: data.data.data.files.label.paper_size,
                url: data.data.data.files.label.url,
                fileType: data.data.data.files.label.fileType
              },
              invoice: {
                paperSize: data.data.data.files?.invoice?.paper_size,
                url: data.data.data.files?.invoice?.url,
                filetType: data.data.data.files?.invoice?.file_type
              },
              customsDeclaration: data.data.data.files.customs_declaration,
              manifest: data.data.data.files.manifest
            },
            rate: {
              chargeWeight: {
                ...data.data.data.rate.charge_weight
              },
              totalCharge: {
                ...data.data.data.rate.total_charge
              },
              serviceName: data.data.data.rate.service_name,
              serviceToken: data.data.data.rate.service_type,
              serviceType: data.data.data.rate.shipper_account.slug,
              shipperAccount: {
                ...data.data.data.rate.shipper_account
              },
              deliveryDate: data.data.data.rate.delivery_date,
              detailedCharges: [...data.data.data.rate.detailed_charges]
            },
            createdAt: data.data.data.created_at,
            updatedAt: data.data.data.updated_at
          },
          warnings: [],
          errors: []
        };
      }

      if (this.service === "dhl") {
        const formattedObject = {
          RequestedShipment: {
            ShipmentInfo: {
              DropOffType: label.dropOffType,
              ServiceType: label.serviceType,
              Account: label.shipperAccount.accountNumber,
              Currency: label.currency,
              UnitOfMeasurement: label.parcels[0].massUnit,
              PackagesCount: 1,
              LabelType: label.labelType,
              LabelTemplate: label.labelTemplate
            },
            ShipTimestamp: getIsoDateTimeGmt(label.timeStamp),
            PickupLocationCloseTime: label.pickupLocationCloseTime,
            SpecialPickupInstruction: label.specialPickupInstruction,
            PickupLocation: label.pickupLocation,
            PaymentInfo: label.paymentInfo,
            InternationalDetail: {
              Commodities: {
                NumberOfPieces:
                  label.internationalDetail.commodities.numberOfPieces,
                Description: label.internationalDetail.commodities.description,
                CountryOfManufacture:
                  label.internationalDetail.commodities.countryOfManufacture,
                Quantity: label.internationalDetail.commodities.quantity,
                UnitPrice: label.internationalDetail.commodities.unitPrice,
                CustomsValue: label.internationalDetail.commodities.customsValue
              },
              Content: label.internationalDetail.content
            },
            Ship: {
              Shipper: {
                Contact: {
                  PersonName: label.shipFrom.contactName,
                  CompanyName: label.shipFrom.companyName,
                  PhoneNumber: label.shipFrom.phone,
                  EmailAddress: label.shipFrom.email
                },
                Address: {
                  StreetLines: label.shipFrom.street1,
                  City: label.shipFrom.city,
                  PostalCode: label.shipFrom.postalCode,
                  CountryCode: label.shipFrom.countryCode
                }
              },
              Recipient: {
                Contact: {
                  PersonName: label.shipTo.contactName,
                  CompanyName: label.shipTo.companyName,
                  PhoneNumber: label.shipTo.phone,
                  EmailAddress: label.shipTo.email
                },
                Address: {
                  StreetLines: label.shipTo.street1,
                  City: label.shipTo.city,
                  PostalCode: label.shipTo.postalCode,
                  CountryCode: label.shipTo.countryCode
                }
              }
            },
            Packages: {
              RequestedPackages: {
                attributes: {
                  number: 1
                },
                Weight: label.parcels[0].weight.value,
                Dimensions: {
                  Length: label.parcels[0].dimension.length,
                  Width: label.parcels[0].dimension.width,
                  Height: label.parcels[0].dimension.height
                },
                CustomerReferences: "TEST CZ-IT"
              }
            }
          }
        };

        const data = await shipmentRequest(
          label.shipperAccount,
          formattedObject
        );

        if (data.response.Notification.length > 0) {
          return errorObj(data.response.Notification);
        }

        const returnedJSON = JSON.stringify(data.response, null, 4);
        const parsedObject = JSON.parse(returnedJSON);

        return {
          data: {
            shipmentIdentificationNumber:
              parsedObject.ShipmentIdentificationNumber,
            dispatchConfirmationNumber: parsedObject.DispatchConfirmationNumber,
            labelImageFormat: parsedObject.LabelImage.LabelImageFormat,
            labelUrl: parsedObject.LabelImage.GraphicImage,
            trackingNumbers: [
              parsedObject.PackagesResult.PackageResult.TrackingNumber
            ]
          },
          warnings: [],
          errors: []
        };
      }
    } catch (error) {
      return errorObj(error);
    }
  }

  async getLabels() {
    /* 
            To get shippo and postmen labels, we need to first create a lable using the label method,
            of this class.
        */
    try {
      if (this.service === "shippo") {
        const resultObject = await this.shippo.transaction.list();
        return {
          data: {
            labels: resultObject.results.map(label => ({
              id: label.object_id,
              status: label.status,
              objectOwner: label.object_owner,
              trackingNumbers: [label.tracking_number],
              trackingStatus: label.tracking_status,
              rate: [
                {
                  id: label.rate
                }
              ],
              labelUrl: label.label_url,
              qrCodeUrl: label.qr_code_url,
              createdAt: label.object_created,
              updatedAt: label.object_updated
            }))
          },
          warnings: [],
          errors: []
        };
      }

      if (this.service === "postmen") {
        const data = await axios.get(
          `${this.postmenUrl}/labels`,
          this.postmentCredentialHeaders
        );

        if (data.data.meta.code === 4104) {
          return {
            data: {},
            warnings: [],
            errors: [...data.data.meta.details]
          };
        }

        return {
          data: {
            labels: data.data.data.labels.map(label => ({
              id: label.id,
              status: label.status,
              trackingNumbers: label.tracking_numbers,
              labelUrl: label.files.label.url,
              files: {
                label: {
                  paperSize: label.files.label.paper_size,
                  url: label.files.label.url,
                  fileType: label.files.label.fileType
                },
                invoice: {
                  paperSize: label.files?.invoice?.paper_size,
                  url: label.files?.invoice?.url,
                  filetType: label.files?.invoice?.file_type
                },
                customsDeclaration: label.files?.customs_declaration,
                manifest: label.files?.manifest
              },
              rate: {
                chargeWeight: {
                  ...label.rate.charge_weight
                },
                totalCharge: {
                  ...label.rate.total_charge
                },
                serviceName: label.rate.service_name,
                serviceToken: label.rate.service_type,
                serviceType: label.rate.shipper_account.slug,
                shipperAccount: {
                  ...label.rate.shipper_account
                },
                deliveryDate: label.rate.delivery_date,
                detailedCharges: [...label.rate.detailed_charges]
              },
              createdAt: label.created_at,
              updatedAt: label.updated_at
            }))
          },
          warnings: [],
          errors: []
        };
      }
    } catch (error) {
      return errorObj(error);
    }
  }

  async getAllManifests() {
    /* 
            To get shippo manifests, we need to first create the manifest using
           the createManifest method of this class and as for postmen, we also
           do the same as querying would always return an empty array if none 
           is found
        */
    try {
      if (this.service === "shippo") {
        const data = await axios({
          method: "get",
          url: `${this.shippoUrl}/manifests`,
          headers: {
            ...this.shippoCredentialHeaders.headers
          }
        });
        return {
          data: {
            manifests: data.data.results.map(manifest => ({
              id: manifest.object_id,
              status: manifest.status,
              createdAt: manifest.object_created,
              shipmentDate: manifest.shipment_date,
              updated: manifest.object_updated,
              shipFromId: manifest.address_from,
              shipperAccount: {
                id: manifest.carrier_account
              },
              documents: manifest.documents,
              transactions: manifest.transactions
            }))
          },
          warnings: [],
          errors: []
        };
      }

      if (this.service === "postmen") {
        const data = await axios({
          method: "get",
          url: `${this.postmenUrl}/manifests`,
          headers: {
            ...this.postmentCredentialHeaders.headers
          }
        });

        if (data.data.meta.code === 4104) {
          return {
            data: {},
            warnings: [],
            errors: [...data.data.meta.details]
          };
        }

        return {
          data: {
            manifests: data.data.data.manifests.map(manifest => ({
              id: manifest.id,
              status: manifest.status,
              labels: [...manifest.labels],
              files: {
                label: manifest?.files?.label,
                invoice: manifest?.files?.invoice,
                customsDeclaration: manifest?.files?.customs_declaration,
                manifest: {
                  paperSize: manifest?.files?.manifest?.paper_size,
                  url: manifest?.files?.manifest?.url,
                  fileType: manifest?.files?.manifest?.file_type
                }
              },
              updatedAt: manifest.updated_at,
              createdAt: manifest.created_at
            }))
          },
          warnings: [],
          errors: []
        };
      }
    } catch (error) {
      return errorObj(error);
    }
  }

  async getManifest(manifestId) {
    /* 
            To get shippo/postmen manifest, we need to provide a manifest id,
            manifests can be created using the method createManifest,
            see tests for body definition
        */
    try {
      if (this.service === "shippo") {
        const manifest = await this.shippo.manifest.retrieve(manifestId);
        return {
          data: {
            id: manifest.object_id,
            status: manifest.status,
            createdAt: manifest.object_created,
            shipmentDate: manifest.shipment_date,
            updated: manifest.object_updated,
            shipFromId: manifest.address_from,
            shipperAccount: {
              id: manifest.carrier_account
            },
            documents: manifest.documents,
            transactions: manifest.transactions
          },
          warnings: [],
          errors: []
        };
      }

      if (this.service === "postmen") {
        const data = await axios.get(
          `${this.postmenUrl}/manifests/${manifestId}`,
          this.postmentCredentialHeaders
        );

        if (data.data.meta.code === 4104 && !data.data.data.id) {
          return {
            data: {},
            warnings: [],
            errors: [...data.data.meta.details]
          };
        }

        if (data.data.meta.message && !data.data.data.id) {
          return {
            data: {},
            warnings: [],
            errors: [data.data.meta.message]
          };
        }

        const manifest = data.data.data;
        return {
          data: {
            id: manifest.id,
            status: manifest.status,
            labels: manifest.labels,
            files: {
              label: manifest?.files?.label,
              invoice: manifest?.files?.invoice,
              customsDeclaration: manifest?.files?.customs_declaration,
              manifest: {
                paperSize: manifest?.files?.manifest?.paper_size,
                url: manifest?.files?.manifest?.url,
                fileType: manifest?.files?.manifest?.file_type
              }
            },
            updatedAt: manifest.updated_at,
            createdAt: manifest.created_at
          },
          warnings: [],
          errors: []
        };
      }
    } catch (error) {
      return errorObj(error);
    }
  }

  async createTracking(trackingObj) {
    /* 
            To create a tracking, we need to provide a body with the 
            following properties
        */
    try {
      if (this.service === "postmen") {
        const formatedObj = {
          tracking_number: trackingObj.trackingNumber,
          slug: trackingObj.slug,
          title: trackingObj.title,
          smses: trackingObj.smses,
          emails: trackingObj.emails,
          order_id: trackingObj.orderId,
          order_id_path: trackingObj.orderIdPath,
          custom_fields: {
            product_name: trackingObj.customFields.productName,
            product_price: trackingObj.customFields.productPrice
          },
          language: trackingObj.language,
          order_promised_delivery_date: trackingObj.orderPromisedDeliveryDate,
          delivery_type: trackingObj.deliveryType,
          pickup_location: trackingObj.pickupLocation
        };

        const data = await axios({
          method: "post",
          url: `${this.afterShipUrl}/trackings`,
          data: { tracking: formatedObj },
          headers: {
            ...this.afterShipHeaders.headers
          }
        });

        if (data.data.meta.code === 4104) {
          return {
            data: {},
            warnings: [],
            errors: [...data.data.meta.details]
          };
        }

        const { tracking } = data.data.data;

        return {
          data: {
            tracking: {
              id: tracking.id,
              serviceType: tracking.slug,
              slug: tracking.slug,
              customerName: tracking.customer_name,
              active: tracking.active,
              note: tracking.note,
              orderId: tracking.order_id,
              shipmentPackageCount: tracking.shipment_package_count,
              shipmentPickupDate: tracking.shipment_pickup_date,
              shipmentDeliveryDate: tracking.shipment_delivery_date,
              shipmentType: tracking.shipment_type,
              shipmentWeight: tracking.shipment_weight,
              shipmentWeightUnit: tracking.shipment_weight_unit,
              signedBy: tracking.signed_by,
              source: tracking.source,
              tag: tracking.tag,
              subtag: tracking.subtag,
              subtagMessage: tracking.subtag_message,
              title: tracking.title,
              trackedCount: tracking.tracked_count,
              lastMileTrackingSupported: tracking.last_mile_tracking_supported,
              language: tracking.language,
              uniqueToken: tracking.unique_token,
              subscribedSmses: tracking.subscribed_smses,
              subscribedEmails: tracking.subscribed_emails,
              returnToSender: tracking.return_to_sender,
              trackingAccountNumber: tracking.tracking_account_number,
              trackingOriginCountry: tracking.tracking_origin_country,
              trackingDestinationCountry: tracking.tracking_destination_country,
              trackingKey: tracking.tracking_key,
              trackingPostalCode: tracking.tracking_postal_code,
              trackingShipDate: tracking.tracking_ship_date,
              trackingState: tracking.tracking_state,
              orderPromisedDeliveryDate: tracking.order_promised_delivery_date,
              deliveryType: tracking.delivery_type,
              pickupLocation: tracking.pickup_location,
              pickupNote: tracking.pickup_note,
              courierTrackingLink: tracking.courier_tracking_link,
              courierRedirectLink: tracking.courier_redirect_link,
              firstAttemptedAt: tracking.first_attempted_at,
              orderIdPath: tracking.order_id_path,
              deliveryTime: tracking.delivery_time,
              customFields: tracking.custom_fields,
              trackingNumber: tracking.tracking_number,
              lastUpdatedAt: tracking.last_updated_at,
              updatedAt: tracking.updated_at,
              createdAt: tracking.created_at,
              expectedDelivery: tracking.expected_delivery,
              originCountryIso3: tracking.origin_country_iso3,
              destinationCountryIso3: tracking.destination_country_iso3,
              courierDestinationCountryIso3:
                tracking.courier_destination_country_iso3
            }
          },
          warnings: [],
          errors: []
        };
      }

      if (this.service === "dhl") {
        const formattedObj = {
          trackingRequest: {
            TrackingRequest: {
              Request: {
                ServiceHeader: {
                  MessageTime: getIsoDateTime(),
                  MessageReference: getMessageReference()
                }
              },
              AWBNumber: {
                ArrayOfAWBNumberItem: [trackingObj.trackingNumber]
              },
              LevelOfDetails: "ALL_CHECK_POINTS",
              PiecesEnabled: "B"
            }
          }
        };

        const data = await trackingRequest(
          trackingObj.shipperAccount,
          formattedObj
        );

        if (
          data.response.Notification &&
          data.response.Notification.length > 0
        ) {
          return errorObj(data.response.Notification);
        }

        const shipment = data.response.trackingResponse.TrackingResponse;
        const parcel =
          data.response.trackingResponse.TrackingResponse.AWBInfo
            .ArrayOfAWBInfoItem.Pieces.PieceInfo.ArrayOfPieceInfoItem
            .PieceDetails;

        return {
          data: {
            tracking: {
              parcels: [
                {
                  height: parcel.Height,
                  width: parcel.Width,
                  depth: parcel.Depth,
                  weight: {
                    value: Number(parcel.Weight),
                    unit: parcel.WeightUnit
                  }
                }
              ],
              trackingNumber: trackingObj.trackingNumber,
              consigneeName:
                shipment.AWBInfo.ArrayOfAWBInfoItem.ShipmentInfo.ConsigneeName,
              shipmentWeight:
                shipment.AWBInfo.ArrayOfAWBInfoItem.ShipmentInfo.Weight,
              shipmentDeliveryDate:
                shipment.AWBInfo.ArrayOfAWBInfoItem.ShipmentInfo.ShipmentDate,
              shipmentWeightUnit:
                shipment.AWBInfo.ArrayOfAWBInfoItem.ShipmentInfo.WeightUnit,
              shipmentPackageCount:
                shipment.AWBInfo.ArrayOfAWBInfoItem.ShipmentInfo.Pieces,
              messageTime: shipment.Response.ServiceHeader.MessageTime,
              messageReference:
                shipment.Response.ServiceHeader.MessageReference,
              destinationServiceArea: {
                ServiceAreaCode:
                  shipment.AWBInfo.ArrayOfAWBInfoItem.ShipmentInfo
                    .DestinationServiceArea.ServiceAreaCode,
                Description:
                  shipment.AWBInfo.ArrayOfAWBInfoItem.ShipmentInfo
                    .DestinationServiceArea.Description,
                FacilityCode:
                  shipment.AWBInfo.ArrayOfAWBInfoItem.ShipmentInfo
                    .DestinationServiceArea.FacilityCode
              }
            }
          },
          warnings: [],
          errors: []
        };
      }
    } catch (error) {
      return errorObj(error);
    }
  }

  async getTrackings() {
    try {
      if (this.service === "postmen") {
        const data = await axios.get(
          `${this.afterShipUrl}/trackings`,
          this.afterShipHeaders
        );

        return {
          data: {
            trackings: data.data.data.trackings.map(tracking => ({
              id: tracking.id,
              serviceType: tracking.slug,
              slug: tracking.slug,
              customerName: tracking.customer_name,
              active: tracking.active,
              note: tracking.note,
              orderId: tracking.order_id,
              shipmentPackageCount: tracking.shipment_package_count,
              shipmentPickupDate: tracking.shipment_pickup_date,
              shipmentDeliveryDate: tracking.shipment_delivery_date,
              shipmentType: tracking.shipment_type,
              shipmentWeight: tracking.shipment_weight,
              shipmentWeightUnit: tracking.shipment_weight_unit,
              signedBy: tracking.signed_by,
              source: tracking.source,
              tag: tracking.tag,
              subtag: tracking.subtag,
              subtagMessage: tracking.subtag_message,
              title: tracking.title,
              trackedCount: tracking.tracked_count,
              lastMileTrackingSupported: tracking.last_mile_tracking_supported,
              language: tracking.language,
              uniqueToken: tracking.unique_token,
              subscribedSmses: tracking.subscribed_smses,
              subscribedEmails: tracking.subscribed_emails,
              returnToSender: tracking.return_to_sender,
              trackingAccountNumber: tracking.tracking_account_number,
              trackingOriginCountry: tracking.tracking_origin_country,
              trackingDestinationCountry: tracking.tracking_destination_country,
              trackingKey: tracking.tracking_key,
              trackingPostalCode: tracking.tracking_postal_code,
              trackingShipDate: tracking.tracking_ship_date,
              trackingState: tracking.tracking_state,
              orderPromisedDeliveryDate: tracking.order_promised_delivery_date,
              deliveryType: tracking.delivery_type,
              pickupLocation: tracking.pickup_location,
              pickupNote: tracking.pickup_note,
              courierTrackingLink: tracking.courier_tracking_link,
              courierRedirectLink: tracking.courier_redirect_link,
              firstAttemptedAt: tracking.first_attempted_at,
              orderIdPath: tracking.order_id_path,
              deliveryTime: tracking.delivery_time,
              customFields: tracking.custom_fields,
              trackingNumber: tracking.tracking_number,
              lastUpdatedAt: tracking.last_updated_at,
              updatedAt: tracking.updated_at,
              createdAt: tracking.created_at,
              expectedDelivery: tracking.expected_delivery,
              originCountryIso3: tracking.origin_country_iso3,
              destinationCountryIso3: tracking.destination_country_iso3,
              courierDestinationCountryIso3:
                tracking.courier_destination_country_iso3
            }))
          },
          warnings: [],
          errors: []
        };
      }
    } catch (error) {
      return errorObj(error);
    }
  }

  async getShipments() {
    try {
      if (this.service === "shippo") {
        const data = await axios({
          method: "get",
          url: `${this.shippoUrl}/shipments`,
          headers: {
            ...this.shippoCredentialHeaders.headers
          }
        });

        return {
          data: {
            shipments: data.data.results.map(shipment => ({
              id: shipment.object_id,
              createdAt: shipment.object_created,
              updatedAt: shipment.object_updated,
              objectOwner: shipment.object_owner,
              shipFrom: {
                id: shipment.address_from.object_id,
                isComplete: shipment.address_from.is_complete,
                contactName: shipment.address_from.name,
                street1: shipment.address_from.street1,
                city: shipment.address_from.city,
                state: shipment.address_from.state,
                zip: shipment.address_from.zip,
                country: shipment.address_from.country,
                phone: shipment.address_from.phone,
                email: shipment.address_from.email,
                validationResults: shipment.address_from.validation_results
              },
              shipTo: {
                id: shipment.address_to.object_id,
                isComplete: shipment.address_to.is_complete,
                contactName: shipment.address_to.name,
                street1: shipment.address_to.street1,
                city: shipment.address_to.city,
                state: shipment.address_to.state,
                zip: shipment.address_to.zip,
                country: shipment.address_to.country,
                phone: shipment.address_to.phone,
                email: shipment.address_to.email,
                validationResults: shipment.address_to.validation_results
              },
              addressReturn: {
                id: shipment.address_return.object_id,
                isComplete: shipment.address_return.is_complete,
                contactName: shipment.address_return.name,
                street1: shipment.address_return.street1,
                city: shipment.address_return.city,
                state: shipment.address_return.state,
                zip: shipment.address_return.zip,
                country: shipment.address_return.country,
                phone: shipment.address_return.phone,
                email: shipment.address_return.email,
                validationResults: shipment.address_return.validation_results
              },
              status: shipment.status,
              parcels: shipment.parcels.map(parcel => ({
                id: parcel.object_id,
                length: parcel.length,
                width: parcel.width,
                height: parcel.height,
                distanceUnit: parcel.distance_unit,
                weight: {
                  value: parcel.weight,
                  unit: parcel.mass_unit
                }
              })),
              rates: shipment.rates.map(rate => ({
                id: rate.object_id,
                status: rate.status,
                serviceType: rate.provider,
                serviceToken: rate.servicelevel.token,
                serviceName: rate.servicelevel.name,
                shipperAccount: {
                  id: rate.carrier_account
                },
                createdAt: rate.object_created,
                totalCharge: {
                  amount: rate.amount,
                  currency: rate.currency
                },
                localTotalCharge: {
                  amountLocal: rate.amount_local,
                  currencyLocal: rate.currency_local
                },
                durationTerms: rate.duration_terms,
                updatedAt: rate.object_updated
              }))
            }))
          },
          warnings: [],
          errors: []
        };
      }
    } catch (error) {
      return errorObj(error);
    }
  }

  async getTracking(trackingObj) {
    /* 
            To get shippo tracking status, we need to provide a tracking carrier and number and 
            as for postmen we need to provide a slug(courier e.g fedex) and an id,
            tracking can be create using the createTracking method
        */
    try {
      if (this.service === "shippo") {
        const data = await axios.get(
          `${this.shippoUrl}/tracks/${trackingObj.trackingSlug}/${trackingObj.trackingNumber}`,
          this.shippoCredentialHeaders
        );
        return {
          data: {
            tracking: {
              slug: trackingObj.trackingSlug,
              shipFrom: {
                street1: data.data.address_from.street1,
                city: data.data.address_from.city,
                state: data.data.address_from.state,
                zip: data.data.address_from.zip,
                country: data.data.address_from.country
              },
              shipTo: {
                street1: data.data.address_to.street1,
                city: data.data.address_to.city,
                state: data.data.address_to.state,
                zip: data.data.address_to.zip,
                country: data.data.address_to.country
              },
              serviceToken: data.data.servicelevel.token,
              serviceType: data.data.carrier,
              serviceName: data.data.servicelevel.name,
              deliveryType: data.data.servicelevel.token,
              trackingNumber: data.data.tracking_number,
              transaction: data.data.transaction,
              trackingStatus: {
                id: data.data.tracking_status.object_id,
                status: data.data.tracking_status.status,
                statusDetails: data.data.tracking_status.status_details,
                statusDate: data.data.tracking_status.status_date,
                createdAt: data.data.tracking_status.object_created,
                updatedAt: data.data.tracking_status.object_created,
                location: data.data.tracking_status.location
              },
              trackingHistory: data.data.tracking_history.map(history => ({
                status: history.status,
                statusDetails: history.status_details,
                statusDate: history.status_date,
                createdAt: history.object_created,
                updatedAt: history.object_created
              }))
            }
          },
          warnings: [],
          errors: []
        };
      }

      if (this.service === "postmen") {
        const errors = validateSchema(trackingObj, postmenGetTrackingSchema);

        if (errors) return errorObj(errors);

        const URL = `${this.afterShipUrl}/trackings/${trackingObj.trackingSlug}/${trackingObj.trackingNumber}`;
        const data = await axios.get(URL, this.afterShipHeaders);

        if (data.data.meta.code === 4104) {
          return {
            data: {},
            warnings: [],
            errors: [...data.data.meta.details]
          };
        }

        const { tracking } = data.data.data;

        return {
          data: {
            tracking: {
              id: tracking.id,
              serviceType: tracking.slug,
              slug: tracking.slug,
              customerName: tracking.customer_name,
              active: tracking.active,
              note: tracking.note,
              orderId: tracking.order_id,
              shipmentPackageCount: tracking.shipment_package_count,
              shipmentPickupDate: tracking.shipment_pickup_date,
              shipmentDeliveryDate: tracking.shipment_delivery_date,
              shipmentType: tracking.shipment_type,
              shipmentWeight: tracking.shipment_weight,
              shipmentWeightUnit: tracking.shipment_weight_unit,
              signedBy: tracking.signed_by,
              source: tracking.source,
              tag: tracking.tag,
              subtag: tracking.subtag,
              subtagMessage: tracking.subtag_message,
              title: tracking.title,
              trackedCount: tracking.tracked_count,
              lastMileTrackingSupported: tracking.last_mile_tracking_supported,
              language: tracking.language,
              uniqueToken: tracking.unique_token,
              subscribedSmses: tracking.subscribed_smses,
              subscribedEmails: tracking.subscribed_emails,
              returnToSender: tracking.return_to_sender,
              trackingAccountNumber: tracking.tracking_account_number,
              trackingOriginCountry: tracking.tracking_origin_country,
              trackingDestinationCountry: tracking.tracking_destination_country,
              trackingKey: tracking.tracking_key,
              trackingPostalCode: tracking.tracking_postal_code,
              trackingShipDate: tracking.tracking_ship_date,
              trackingState: tracking.tracking_state,
              orderPromisedDeliveryDate: tracking.order_promised_delivery_date,
              deliveryType: tracking.delivery_type,
              pickupLocation: tracking.pickup_location,
              pickupNote: tracking.pickup_note,
              courierTrackingLink: tracking.courier_tracking_link,
              courierRedirectLink: tracking.courier_redirect_link,
              firstAttemptedAt: tracking.first_attempted_at,
              orderIdPath: tracking.order_id_path,
              deliveryTime: tracking.delivery_time,
              customFields: tracking.custom_fields,
              trackingNumber: tracking.tracking_number,
              lastUpdatedAt: tracking.last_updated_at,
              updatedAt: tracking.updated_at,
              createdAt: tracking.created_at,
              expectedDelivery: tracking.expected_delivery,
              originCountryIso3: tracking.origin_country_iso3,
              destinationCountryIso3: tracking.destination_country_iso3,
              courierDestinationCountryIso3:
                tracking.courier_destination_country_iso3
            }
          },
          warnings: [],
          errors: []
        };
      }

      if (this.service === "dhl") {
        const formattedObj = {
          trackingRequest: {
            TrackingRequest: {
              Request: {
                ServiceHeader: {
                  MessageTime: getIsoDateTime(),
                  MessageReference: getMessageReference()
                }
              },
              AWBNumber: {
                ArrayOfAWBNumberItem: [trackingObj.trackingNumber]
              },
              LevelOfDetails: "ALL_CHECK_POINTS",
              PiecesEnabled: "B"
            }
          }
        };

        const data = await trackingRequest(
          trackingObj.shipperAccount,
          formattedObj
        );

        if (
          data.response.Notification &&
          data.response.Notification.length > 0
        ) {
          return errorObj(data.response.Notification);
        }

        const shipment = data.response.trackingResponse.TrackingResponse;
        const parcel =
          data?.response?.trackingResponse?.TrackingResponse?.AWBInfo
            ?.ArrayOfAWBInfoItem?.Pieces?.PieceInfo?.ArrayOfPieceInfoItem
            ?.PieceDetails;
        return {
          data: {
            tracking: {
              parcels: [
                {
                  height: parcel.Height,
                  width: parcel.Width,
                  depth: parcel.Depth,
                  weight: {
                    value: Number(parcel.Weight),
                    unit: parcel.WeightUnit
                  }
                }
              ],
              trackingNumber: trackingObj.trackingNumber,
              consigneeName:
                shipment.AWBInfo.ArrayOfAWBInfoItem.ShipmentInfo.ConsigneeName,
              shipmentWeight:
                shipment.AWBInfo.ArrayOfAWBInfoItem.ShipmentInfo.Weight,
              shipmentDeliveryDate:
                shipment.AWBInfo.ArrayOfAWBInfoItem.ShipmentInfo.ShipmentDate,
              shipmentWeightUnit:
                shipment.AWBInfo.ArrayOfAWBInfoItem.ShipmentInfo.WeightUnit,
              shipmentPackageCount:
                shipment.AWBInfo.ArrayOfAWBInfoItem.ShipmentInfo.Pieces,
              messageTime: shipment.Response.ServiceHeader.MessageTime,
              messageReference:
                shipment.Response.ServiceHeader.MessageReference,
              destinationServiceArea: {
                ServiceAreaCode:
                  shipment.AWBInfo.ArrayOfAWBInfoItem.ShipmentInfo
                    .DestinationServiceArea.ServiceAreaCode,
                Description:
                  shipment.AWBInfo.ArrayOfAWBInfoItem.ShipmentInfo
                    .DestinationServiceArea.Description,
                FacilityCode:
                  shipment.AWBInfo.ArrayOfAWBInfoItem.ShipmentInfo
                    .DestinationServiceArea.FacilityCode
              }
            }
          },
          warnings: [],
          errors: []
        };
      }
    } catch (error) {
      console.log("error", error);
      return errorObj(error);
    }
  }

  async deleteLabel(labelId) {
    /* 
            To cancel postmen label, we need to provide the label id
            this can be got using getLabels
        */
    try {
      if (this.service === "shippo") {
        const data = await this.shippo.refund.create({
          transaction: labelId
        });

        return {
          data: {
            id: data.object_id,
            status: data.status,
            transaction: data.transaction,
            objectOwner: data.objectOwner,
            createdAt: data.object_created,
            updatedAt: data.object_updated
          },
          warnings: [],
          errors: []
        };
      }

      if (this.service === "postmen") {
        const data = await axios({
          method: "post",
          url: `${this.postmenUrl}/cancel-labels`,
          data: {
            label: { id: labelId },
            async: false
          },
          headers: { ...this.postmentCredentialHeaders.headers }
        });

        if (data.data.meta.code === 4104) {
          return {
            data: {},
            warnings: [],
            errors: [...data.data.meta.details]
          };
        }

        if (data.data.meta.code === 4153) {
          return {
            data: {},
            warnings: [],
            errors: [data.data.meta.message]
          };
        }

        return {
          data: {
            id: data.data.data.id,
            status: data.data.data.status,
            createdAt: data.data.data.createdAt,
            updatedAt: data.data.data.updatedAt
          },
          warnings: [],
          errors: []
        };
      }
    } catch (error) {
      return errorObj(error);
    }
  }
}
export default Shipment;
