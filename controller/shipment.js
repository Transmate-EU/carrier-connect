/* eslint-disable consistent-return */
import axios from "axios";
import shippoApi from "shippo";
import {
  getMessageReference,
  rateRequest,
  getIsoDateTime,
  shipmentRequest,
  trackingRequest,
  testTrackingRequest,
  testRateRequest,
  testShipmentRequest
} from "./dhl-node";
import {
  validateSchema,
  shipmentSchema,
  manifestSchema
} from "../schemas/schemas";
import {
  ratesRequestFormatter,
  shipmentRequestFormatter,
  shipmentResponseFormatter,
  ratesResponseFormatter,
  labelsResponseFormatter,
  labelRequestFormatter,
  addressRequestFormatter,
  addressResponseFormatter,
  trackingRequestFormatter,
  trackingResponseFormatter,
  manifestResponseFormatter
} from "../utils/formatters";

const debug = require("debug")("shipmentController");

const POSTMEN_SANDBOX_URL = "https://sandbox-api.postmen.com/v3";
const POSTMEN_PROD_URL = "https://prod-api.postmen.com/v3";
const SHIPPO_URL = "https://api.goshippo.com/";
const AFTER_SHIP_URL = "https://api.aftership.com/v4";

function errorObj(error, type, validationErrors) {
  debug("error on error object", error);
  if (validationErrors) {
    return {
      data: {},
      warnings: [],
      errors: error.map(err => ({
        type: "validation-errors",
        info: err.message,
        field: err.instancePath.split("/")[1]
      }))
    };
  }
  if (Array.isArray(error)) {
    if (type === "postmen") {
      return {
        data: {},
        warnings: [],
        errors: error.map(err => ({
          type,
          info: err.info
        }))
      };
    }

    if (type === "shippo") {
      return {
        data: {},
        warnings: [],
        errors: error.map(err => ({
          type,
          info: err.text || err.info || err.transaction
        }))
      };
    }

    if (type === "dhl") {
      return {
        data: {},
        warnings: [],
        errors: error.map(err => ({
          type,
          info: err.Message || err.info
        }))
      };
    }

    // validations errors
    return {
      data: {},
      warnings: [],
      errors: error.map(err => ({
        type,
        info: err.Message || err.info || err.text
      }))
    };
  }

  if (error.detail) {
    if (type === "shippo") {
      const errorValue = Object.values(error.detail);
      return {
        data: {},
        warnings: [],
        errors: errorValue.map(err => ({
          type,
          info: err[0]
        }))
      };
    }

    return {
      data: {},
      warnings: [],
      errors: [{ type, info: error.detail }]
    };
  }

  if (error.response) {
    if (type === "shippo") {
      const errorValue = Object.values(error.response.data);
      return {
        data: {},
        warnings: [],
        errors: errorValue.map(err => ({
          type,
          info: err[0]
        }))
      };
    }
    return {
      data: {},
      warnings: [],
      errors: [{ type, info: error.response.data }]
    };
  }

  return {
    data: {},
    warnings: [],
    errors: [{ type, info: error.message }]
  };
}

class Shipment {
  constructor(service, context = process.env || {}) {
    debug("shipment constructor called %o", context);
    debug("SANDBOX? %o ", context.SANDBOX);

    const sandbox = context.SANDBOX === true || context.SANDBOX === "true";
    this.postmenUrl = sandbox ? POSTMEN_SANDBOX_URL : POSTMEN_PROD_URL;
    this.testEnv = sandbox;
    this.shipperManifestAccount = context.SHIPPER_MANIFEST_TEST_ID;
    this.shippoApiKey = sandbox
      ? context.SHIPPO_TEST_API_KEY
      : context.SHIPPO_PROD_API_KEY;
    this.postmentApiKey = sandbox
      ? context.POSTMEN_TEST_API_KEY
      : context.POSTMEN_PROD_API_KEY;
    this.afterShipApiKey = sandbox
      ? context.AFTER_SHIP_TEST_API_KEY
      : context.AFTER_SHIP_PROD_API_KEY;

    this.shippo = this.shippoApiKey ? shippoApi(this.shippoApiKey) : null;
    this.shipperAccount = {
      id: context.SHIPPER_ACCOUNT_ID,
      username: context.SHIPPER_ACCOUNT_USERNAME,
      password: context.SHIPPER_ACCOUNT_PASSWORD,
      accountNumber: context.SHIPPER_ACCOUNT_ACC_NUMBER
    };
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
      throw new Error("you must select a service (postmen/goshippo/dhl)");
    if (this.service === "shippo" && !this.shippo)
      throw new Error("check keys for shippo!");
    if (this.service === "postmen" && !this.postmentApiKey)
      throw new Error("please provide postmen API key!");
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
      const errors = validateSchema(
        {
          ...requestObject,
          shipmentDate: requestObject.shipmentDate
            ? new Date(requestObject.shipmentDate)
            : ""
        },
        shipmentSchema
      );
      if (errors) return errorObj(errors, this.service, true);

      const { shipmentDate } = requestObject;
      const { getLabel } = requestObject;
      const { serviceType } = requestObject;

      if (this.service === "shippo") {
        const { formattedObject } = shipmentRequestFormatter(
          this.service,
          requestObject
        );

        const shipmentObj = await this.shippo.shipment.create(
          formattedObject.shipment
        );

        let label;

        // fetch label if getLabel and serviceType
        if (getLabel) {
          const labelData = await this.createLabel(requestObject);
          if (labelData.errors.length > 0) {
            return errorObj(labelData.errors, this.service);
          }
          label = labelData.data.label;
        }

        debug("shippo return %o", shipmentObj);

        const { shipment } = shipmentResponseFormatter(this.service, {
          ...shipmentObj,
          getLabel,
          label
        });

        if (shipmentObj.messages && shipmentObj.status !== "QUEUED") {
          return errorObj(shipmentObj.messages, this.service);
        }

        return {
          data: {
            shipment
          },
          warnings: [],
          errors: []
        };
      }

      if (this.service === "dhl") {
        const serviceTypes = ["K", "T", "Y", "E", "P", "U", "D", "N", "H", "W"];
        const { formattedObject } = shipmentRequestFormatter(this.service, {
          ...requestObject,
          shipperAccount: this.shipperAccount
        });

        if (!serviceTypes.includes(requestObject.serviceType)) {
          return errorObj(
            [
              {
                Message:
                  "DHL service type can only be one of these K, T, Y, E, P, U, D, N, H, W"
              }
            ],
            this.service
          );
        }

        let data;

        if (this.testEnv) {
          data = await testShipmentRequest(
            this.shipperAccount,
            formattedObject
          );
        }

        if (!this.testEnv) {
          data = await shipmentRequest(this.shipperAccount, formattedObject);
        }

        debug("return dhl %o", data.response);
        const returnedJSON = JSON.stringify(data.response, null, 4);
        const parsedObject = JSON.parse(returnedJSON);

        if (
          data.response.Notification &&
          !parsedObject.ShipmentIdentificationNumber
        ) {
          return errorObj(data.response.Notification, this.service);
        }

        const ratesData = await this.getRates(requestObject);
        const { shipment } = shipmentResponseFormatter("dhl", {
          ...parsedObject,
          ratesData,
          getLabel,
          shipmentDate
        });
        return {
          data: {
            shipment
          },
          warnings: [],
          errors: []
        };
      }

      if (this.service === "postmen") {
        const { formattedObject } = shipmentRequestFormatter(this.service, {
          ...requestObject,
          shipperAccount: this.shipperAccount
        });

        const data = await axios({
          method: "post",
          url: `${this.postmenUrl}/rates`,
          data: formattedObject,
          headers: {
            ...this.postmentCredentialHeaders.headers
          }
        });

        if (data.data.meta.code !== 200 && data.data.meta.details.length > 0) {
          return {
            data: {},
            warnings: [],
            errors: [...data.data.meta.details]
          };
        }

        if (
          data.data.meta.code !== 200 &&
          data.data.meta.details.length === 0
        ) {
          return {
            data: {},
            warnings: [],
            errors: [data.data.meta.message]
          };
        }

        let label;

        if (serviceType && getLabel) {
          const labelData = await this.createLabel({
            ...requestObject
          });
          label = labelData.data.label;
        }

        const { shipment } = shipmentResponseFormatter(this.service, {
          ...data.data.data,
          label
        });

        return {
          data: {
            shipment
          },
          warnings: [],
          errors: []
        };
      }
    } catch (error) {
      return errorObj(error, this.service);
    }
  }

  async createCarrierAccount(requestObject) {
    try {
      if (this.service === "shippo") {
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
      return errorObj(error, this.service);
    }
  }

  async createManifest(manifest) {
    try {
      const errors = validateSchema(manifest, manifestSchema);
      if (errors) return errorObj(errors, this.service);

      if (this.service === "shippo") {
        const formatedManifest = {
          shipment_date: manifest.shipmentDate,
          transactions: manifest.labelIds,
          carrier_account: manifest.shipperManifestAccountId,
          address_from: manifest.shipFromId
        };

        const resultObject = await this.shippo.manifest.create(
          formatedManifest
        );

        return {
          data: {
            status: resultObject.status,
            createdAt: resultObject.object_created,
            updatedAt: resultObject.object_updated,
            shipFromId: resultObject.address_from,
            shipperAccount: {
              id: this.shipperAccount.id
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
            id: manifest.shipperManifestAccountId
              ? manifest.shipperManifestAccountId
              : this.shipperAccount.id
          },
          label_ids: manifest.labelIds
        };

        const data = await axios({
          method: "post",
          url: `${this.postmenUrl}/manifests`,
          data: formatedManifest,
          headers: {
            ...this.postmentCredentialHeaders.headers
          }
        });

        if (
          data.data.meta.message ===
          "Access to shipper_account locked during manifest/cancel-label operation."
        ) {
          const manifests = await this.getAllManifests();
          return {
            data: {
              manifest: manifests.data.manifests[0]
            },
            warnings: [
              {
                info: "Manifestation of label ids has started/already in progress"
              }
            ],
            errors: []
          };
        }

        if (data.data.meta.code !== 200 && data.data.meta.details.length > 0) {
          return {
            data: {},
            warnings: [],
            errors: [...data.data.meta.details]
          };
        }

        if (
          data.data.meta.code !== 200 &&
          data.data.meta.details.length === 0
        ) {
          return {
            data: {},
            warnings: [],
            errors: [data.data.meta.message]
          };
        }

        const { manifests } = manifestResponseFormatter(this.service, [
          data.data.data
        ]);

        return {
          data: {
            manifest: manifests[0]
          },
          warnings: [],
          errors: []
        };
      }
    } catch (error) {
      if (error.message.search("temporary error")) {
        const manifests = await this.getAllManifests();
        return {
          data: {
            manifest: manifests.data.manifests[0]
          },
          warnings: [
            {
              info: "Manifestation of label ids has started/already in progress"
            }
          ],
          errors: []
        };
      }
      return errorObj(error, this.service);
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
      if (this.service === "shippo" || this.service === "postmen") {
        const shipmentResp = await this.createShipment({
          ...shipment,
          getLabel: false
        });
        if (shipmentResp.errors.length > 0) {
          return errorObj(shipmentResp.errors, this.service);
        }
        return {
          data: {
            rates: shipmentResp.data.shipment.rates
          },
          warnings: [],
          errors: []
        };
      }

      if (this.service === "dhl") {
        const { formattedObject } = ratesRequestFormatter("dhl", {
          ...shipment,
          shipperAccount: this.shipperAccount
        });

        let data;
        if (this.testEnv) {
          data = await testRateRequest(this.shipperAccount, formattedObject);
        }

        if (!this.testEnv) {
          data = await rateRequest(this.shipperAccount, formattedObject);
        }

        const returnedJSON = JSON.stringify(data.response, null, 4);
        debug("dhl rate return %j", data.response);
        const parsedObject = JSON.parse(returnedJSON);

        if (
          parsedObject.Provider.Notification &&
          !parsedObject.Provider.Service
        ) {
          return errorObj(parsedObject.Provider.Notification, this.service);
        }
        debug("rates return %j", parsedObject);
        const { rates } = ratesResponseFormatter(this.service, {
          rates: parsedObject.Provider.Service
        });
        return {
          data: {
            rates
          },
          warnings: parsedObject.Provider.Notification,
          errors: []
        };
      }
    } catch (error) {
      return errorObj(error, this.service);
    }
  }

  async createAddress(address) {
    try {
      if (this.service === "shippo") {
        const { formattedObject } = addressRequestFormatter(
          this.service,
          address
        );

        const resultObject = await this.shippo.address.create(formattedObject);

        const { address: createdAddress } = addressResponseFormatter(
          this.service,
          resultObject
        );

        return {
          data: {
            address: createdAddress
          },
          warnings: [],
          errors: []
        };
      }
    } catch (error) {
      return errorObj(error, this.service);
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
        const createdAddress = await this.createAddress(address);

        const resultObject = await this.shippo.address.validate(
          createdAddress.data.address.id
        );

        const { address: addressResp } = addressResponseFormatter(
          this.service,
          resultObject
        );

        return {
          data: {
            address: addressResp
          },
          warnings: [],
          errors: []
        };
      }

      if (this.service === "postmen") {
        const { formattedObject } = addressRequestFormatter(
          this.service,
          address
        );

        const data = await axios({
          method: "post",
          url: `${this.postmenUrl}/address-validations`,
          data: { address: formattedObject },
          headers: {
            ...this.postmentCredentialHeaders.headers
          }
        });

        if (data.data.meta.code !== 200 && data.data.meta.details.length > 0) {
          return {
            data: {},
            warnings: [],
            errors: [...data.data.meta.details]
          };
        }

        if (
          data.data.meta.code !== 200 &&
          data.data.meta.details.length === 0
        ) {
          return {
            data: {},
            warnings: [],
            errors: [data.data.meta.message]
          };
        }

        const { addressResp } = addressResponseFormatter(
          this.service,
          data.data.data
        );

        return {
          data: {
            address: addressResp
          },
          warnings: [],
          errors: []
        };
      }
    } catch (error) {
      return errorObj(error, this.service);
    }
  }

  async createLabel(shipment) {
    try {
      const errors = validateSchema(
        {
          ...shipment,
          shipmentDate: shipment.shipmentDate
            ? new Date(shipment.shipmentDate)
            : ""
        },
        shipmentSchema
      );
      if (errors) return errorObj(errors, this.service, true);

      if (this.service === "shippo") {
        const { formattedObject: shipmentObject } = labelRequestFormatter(
          this.service,
          { ...shipment, shipperAccount: this.shipperAccount }
        );

        const data = await axios({
          method: "post",
          url: `${this.shippoUrl}/transactions`,
          data: shipmentObject,
          headers: {
            ...this.shippoCredentialHeaders.headers
          }
        });

        const resultObject = data.data;

        if (resultObject.status !== "SUCCESS") {
          return errorObj(resultObject.messages, this.service);
        }

        const { labels } = labelsResponseFormatter(this.service, {
          labels: [resultObject]
        });

        return {
          data: {
            label: labels[0]
          },
          warnings: [],
          errors: []
        };
      }

      if (this.service === "postmen") {
        const { formattedObject } = labelRequestFormatter(this.service, {
          ...shipment,
          shipperAccount: this.shipperAccount
        });

        const data = await axios({
          method: "post",
          url: `${this.postmenUrl}/labels`,
          data: formattedObject,
          headers: {
            ...this.postmentCredentialHeaders.headers
          }
        });

        if (data.data.meta.code !== 200 && data.data.meta.details.length > 0) {
          return errorObj([...data.data.meta.details], this.service);
        }

        if (
          data.data.meta.code !== 200 &&
          data.data.meta.details.length === 0
        ) {
          return errorObj([data.data.meta.message], this.service);
        }

        const { labels } = labelsResponseFormatter(this.service, {
          labels: [data.data.data]
        });

        return {
          data: {
            label: labels[0]
          },
          warnings: [],
          errors: []
        };
      }

      if (this.service === "dhl") {
        const shipmentResp = await this.createShipment({
          ...shipment,
          getLabel: true
        });
        if (shipmentResp.errors.length > 0) {
          return errorObj(shipmentResp.errors);
        }
        return {
          data: {
            label: {
              id: shipmentResp.data.shipment.id,
              labelUrl: shipmentResp.data.shipment.label.labelUrl,
              trackingNumbers: [shipmentResp.data.shipment.id],
              status: "created",
              createdAt: new Date().toString()
            }
          },
          warnings: [],
          errors: []
        };
      }
    } catch (error) {
      return errorObj(error, this.service);
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
        const { labels } = labelsResponseFormatter(
          this.service,
          resultObject.results
        );
        return {
          data: {
            labels
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

        if (data.data.meta.code !== 200 && data.data.meta.details.length > 0) {
          return {
            data: {},
            warnings: [],
            errors: [...data.data.meta.details]
          };
        }

        if (
          data.data.meta.code !== 200 &&
          data.data.meta.details.length === 0
        ) {
          return {
            data: {},
            warnings: [],
            errors: [data.data.meta.message]
          };
        }
        const { labels } = labelsResponseFormatter(this.service, {
          ...data.data.data
        });

        return {
          data: {
            labels
          },
          warnings: [],
          errors: []
        };
      }
    } catch (error) {
      return errorObj(error, this.service);
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

        const { manifests } = manifestResponseFormatter(
          this.service,
          data.data.results
        );
        return {
          data: {
            manifests
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

        if (data.data.meta.code !== 200 && data.data.meta.details.length > 0) {
          return {
            data: {},
            warnings: [],
            errors: [...data.data.meta.details]
          };
        }

        if (
          data.data.meta.code !== 200 &&
          data.data.meta.details.length === 0
        ) {
          return {
            data: {},
            warnings: [],
            errors: [data.data.meta.message]
          };
        }

        const { manifests } = manifestResponseFormatter(
          this.service,
          data.data.data.manifests
        );

        return {
          data: {
            manifests
          },
          warnings: [],
          errors: []
        };
      }
    } catch (error) {
      return errorObj(error, this.service);
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
        const { manifests } = manifestResponseFormatter(this.service, [
          manifest
        ]);
        return {
          data: {
            manifest: manifests[0]
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

        if (data.data.meta.code === 3001) {
          const { manifests } = manifestResponseFormatter(this.service, [
            data.data.data
          ]);
          return {
            data: {
              manifest: manifests[0]
            },
            warnings: [],
            errors: []
          };
        }

        if (data.data.meta.code !== 200 && data.data.meta.details.length > 0) {
          return errorObj([...data.data.meta.details], this.service);
        }

        if (
          data.data.meta.code !== 200 &&
          data.data.meta.details.length === 0
        ) {
          return errorObj([{ info: data.data.meta.message }], this.service);
        }

        const { manifests } = manifestResponseFormatter(this.service, [
          data.data.data
        ]);
        return {
          data: {
            manifest: manifests[0]
          },
          warnings: [],
          errors: []
        };
      }
    } catch (error) {
      return errorObj(error, this.service);
    }
  }

  async createTracking(trackingObj) {
    /* 
            To create a tracking, we need to provide a body with the 
            following properties
        */
    try {
      if (this.service === "postmen") {
        const { formattedObject } = trackingRequestFormatter(
          this.service,
          trackingObj
        );

        const data = await axios({
          method: "post",
          url: `${this.afterShipUrl}/trackings`,
          data: { tracking: formattedObject },
          headers: {
            ...this.afterShipHeaders.headers
          }
        });

        if (data.data.meta.code !== 200 && data.data.meta.details.length > 0) {
          return {
            data: {},
            warnings: [],
            errors: [...data.data.meta.details]
          };
        }

        if (
          data.data.meta.code !== 200 &&
          data.data.meta.details.length === 0
        ) {
          return {
            data: {},
            warnings: [],
            errors: [data.data.meta.message]
          };
        }

        const { tracking } = trackingResponseFormatter(
          this.service,
          data.data.data.tracking
        );

        return {
          data: {
            tracking
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

        let data;

        if (this.testEnv) {
          data = await testTrackingRequest(this.shipperAccount, formattedObj);
        }

        if (!this.testEnv) {
          data = await trackingRequest(this.shipperAccount, formattedObj);
        }

        if (
          data.response.Notification &&
          data.response.Notification.length > 0
        ) {
          return errorObj(data.response.Notification, this.service);
        }

        const shipment = data.response.trackingResponse.TrackingResponse;
        if (!shipment.AWBInfo.ArrayOfAWBInfoItem) {
          return errorObj(
            [`no tracking details for DHL AWB ${trackingObj.trackingNumber}`],
            this.service
          );
        }
        debug("shipment %j", shipment);
        const { tracking } = trackingResponseFormatter(this.service, {
          ...shipment,
          trackingNumber: trackingObj.trackingNumber
        });
        return {
          data: {
            tracking
          },
          warnings: [],
          errors: []
        };
      }
    } catch (error) {
      return errorObj(error, this.service);
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
        const { tracking } = trackingResponseFormatter(this.service, data.data);
        return {
          data: {
            tracking
          },
          warnings: [],
          errors: []
        };
      }

      if (this.service === "postmen") {
        const URL = `${this.afterShipUrl}/trackings/${trackingObj.trackingSlug}/${trackingObj.trackingNumber}`;
        const data = await axios.get(URL, this.afterShipHeaders);

        if (data.data.meta.code !== 200 && data.data.meta.details.length > 0) {
          return {
            data: {},
            warnings: [],
            errors: [...data.data.meta.details]
          };
        }

        if (
          data.data.meta.code !== 200 &&
          data.data.meta.details.length === 0
        ) {
          return {
            data: {},
            warnings: [],
            errors: [data.data.meta.message]
          };
        }

        const { tracking } = trackingResponseFormatter(
          this.service,
          data.data.data
        );

        return {
          data: {
            tracking
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

        let data;

        if (this.testEnv) {
          data = await testTrackingRequest(this.shipperAccount, formattedObj);
        }

        if (!this.testEnv) {
          data = await trackingRequest(this.shipperAccount, formattedObj);
        }
        debug("response DHL tracking %j", data.response);
        if (
          data.response.Notification &&
          data.response.Notification.length > 0
        ) {
          return errorObj(data.response.Notification, this.service);
        }

        const shipment = data.response.trackingResponse.TrackingResponse;
        if (!shipment.AWBInfo.ArrayOfAWBInfoItem[0].AWBNumber) {
          return errorObj(
            [
              {
                info: `no tracking details for DHL AWB ${trackingObj.trackingNumber}`
              }
            ],
            this.service
          );
        }
        debug("shipment %j", shipment);
        const { tracking } = trackingResponseFormatter(this.service, {
          ...shipment,
          trackingNumber: trackingObj.trackingNumber
        });
        return {
          data: {
            tracking
          },
          warnings: [],
          errors: []
        };
      }
    } catch (error) {
      return errorObj(error, this.service);
    }
  }

  async deleteLabel(labelId) {
    /* 
            To cancel postmen label, we need to provide the label id
            this can be got using getLabels
        */
    try {
      if (!labelId) {
        return errorObj(
          [{ info: "A label id is required to cancel label" }],
          this.service
        );
      }

      if (this.service === "shippo") {
        const data = await this.shippo.refund.create({
          transaction: labelId
        });

        return {
          data: {
            label: {
              id: data.object_id,
              status: "cancelled",
              createdAt: data.object_created,
              updatedAt: data.object_updated
            }
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

        if (data.data.meta.code !== 200 && data.data.meta.details.length > 0) {
          return errorObj([...data.data.meta.details], this.service);
        }

        if (
          data.data.meta.code !== 200 &&
          data.data.meta.details.length === 0
        ) {
          return errorObj([{ info: data.data.meta.message }], this.service);
        }

        return {
          data: {
            label: {
              id: data.data.data.id,
              status: "cancelled",
              createdAt: data.data.data.created_at,
              updatedAt: data.data.data.updated_at
            }
          },
          warnings: [],
          errors: []
        };
      }
    } catch (error) {
      return errorObj(error, this.service);
    }
  }
}
export default Shipment;
