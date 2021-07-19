import isoCountries from "i18n-iso-countries";
import { getIsoDateTimeGmt } from "../controller/dhl-node";

const shipmentRequestFormatter = (returnType, objct) => {
  const { shipmentDate } = objct;
  const { shipmentMetadata } = objct;
  const { serviceType } = objct;
  const { shipFrom } = objct.shipment;
  const { shipTo } = objct.shipment;
  const { parcels } = objct.shipment;
  const { shipperAccount } = objct;

  if (returnType === "dhl") {
    const formattedObject = {
      RequestedShipment: {
        ShipmentInfo: {
          DropOffType: "REQUEST_COURIER",
          ServiceType: serviceType,
          Account: shipperAccount.accountNumber,
          Currency: parcels[0].items[0].price.currency,
          UnitOfMeasurement: parcels[0].massUnit === "lb" ? "SI" : "SU",
          PackagesCount: parcels.length,
          LabelType: shipmentMetadata ? shipmentMetadata.labelType : "PDF",
          RequestAdditionalInformation: "Y",
          LabelTemplate: shipmentMetadata
            ? shipmentMetadata.labelTemplate
            : "ECOM26_84_001"
        },
        ShipTimestamp: getIsoDateTimeGmt(new Date(shipmentDate)),
        PickupLocationCloseTime: shipmentMetadata
          ? shipmentMetadata.pickupLocationCloseTime
          : "23:59",
        SpecialPickupInstruction: shipmentMetadata
          ? shipmentMetadata.specialPickupInstruction
          : "",
        PickupLocation: shipmentMetadata ? shipmentMetadata.pickupLocation : "",
        PaymentInfo: shipmentMetadata ? shipmentMetadata.paymentInfo : "DDP",
        GetRateEstimates: "Y",
        InternationalDetail: {
          Commodities: {
            NumberOfPieces: parcels.length,
            Description: parcels[0].description,
            CountryOfManufacture: shipFrom.countryCode,
            Quantity: parcels.length,
            UnitPrice: 1,
            CustomsValue: shipmentMetadata
              ? shipmentMetadata.internationalDetail.customs
              : 1
          },
          Content:
            shipmentMetadata && shipmentMetadata.internationalDetail
              ? shipmentMetadata.internationalDetail.content
              : "NON_DOCUMENTS"
        },
        Ship: {
          Shipper: {
            Contact: {
              PersonName: shipFrom.contactName,
              CompanyName: shipFrom.companyName,
              PhoneNumber: shipFrom.phone,
              EmailAddress: shipFrom.email
            },
            Address: {
              StreetLines: shipFrom.street1,
              City: shipFrom.city,
              PostalCode: shipFrom.postalCode,
              CountryCode: shipFrom.countryCode
            }
          },
          Recipient: {
            Contact: {
              PersonName: shipTo.contactName,
              CompanyName: shipTo.companyName,
              PhoneNumber: shipTo.phone,
              EmailAddress: shipTo.email
            },
            Address: {
              StreetLines: shipTo.street1,
              City: shipTo.city,
              PostalCode: shipTo.postalCode,
              CountryCode: shipTo.countryCode
            }
          }
        },
        Packages: {
          RequestedPackages: {
            attributes: {
              number: 1
            },
            Weight: parcels[0].weight.value,
            Dimensions: {
              Length: parcels[0].dimension.length,
              Width: parcels[0].dimension.width,
              Height: parcels[0].dimension.height
            },
            CustomerReferences: shipmentMetadata
              ? shipmentMetadata.customersReference
              : parcels[0].description
          }
        }
      }
    };

    return {
      formattedObject
    };
  }

  if (returnType === "shippo") {
    const formattedObject = {
      shipment: {
        parcels: parcels.map(parcel => ({
          width: parcel.width,
          length: parcel.length,
          height: parcel.height,
          mass_unit: parcel.massUnit,
          distance_unit: parcel.distanceUnit,
          weight: parcel.weight.value.toString()
        })),
        address_from: {
          name: shipFrom.contactName,
          street1: shipFrom.street1,
          city: shipFrom.city,
          state: shipFrom.state,
          zip: shipFrom.postalCode,
          country: shipFrom.countryCode,
          phone: shipFrom.phone,
          email: shipFrom.email,
          company: shipFrom.companyName
        },
        address_to: {
          name: shipTo.contactName,
          street1: shipTo.street1,
          city: shipTo.city,
          state: shipTo.state,
          zip: shipTo.postalCode,
          country: shipTo.countryCode,
          phone: shipTo.phone,
          email: shipTo.email,
          company: shipTo.companyName
        }
      }
    };

    return {
      formattedObject
    };
  }

  if (returnType === "postmen") {
    const shipFromCC = isoCountries.alpha2ToAlpha3(shipFrom.countryCode, "en", {
      select: "official"
    });
    const shipToCC = isoCountries.alpha2ToAlpha3(shipTo.countryCode, "en", {
      select: "official"
    });
    const formattedObject = {
      shipment: {
        ship_from: {
          contact_name: shipFrom.contactName,
          street1: shipFrom.street1,
          city: shipFrom.city,
          state: shipFrom.state,
          country: shipFromCC,
          phone: shipFrom.phone,
          email: shipFrom.email,
          postal_code: shipFrom.postalCode
        },
        ship_to: {
          contact_name: shipTo.contactName,
          street1: shipTo.street1,
          city: shipTo.city,
          state: shipTo.state,
          country: shipToCC,
          phone: shipTo.phone,
          email: shipTo.email,
          postal_code: shipTo.postalCode
        },
        parcels: parcels.map(parcel => ({
          box_type: parcel.boxType,
          description: parcel.description,
          weight: parcel.weight,
          dimension: {
            width: parcel.dimension.width,
            height: parcel.dimension.height,
            depth: parcel.dimension.depth,
            unit: parcel.dimension.unit
          },
          items: parcel.items.map(item => ({
            description: item.description,
            origin_country: shipFromCC,
            quantity: item.quantity,
            price: item.price,
            weight: item.weight,
            sku: item.sku
          }))
        }))
      },
      shipper_accounts: [{ id: shipperAccount.id }]
    };

    return {
      formattedObject
    };
  }

  return {};
};

const shipmentResponseFormatter = (returnType, objct) => {
  if (returnType === "dhl") {
    const {
      ShipmentIdentificationNumber,
      shipmentDate,
      ratesData,
      getLabel,
      LabelImage
    } = objct;
    return {
      shipment: {
        id: ShipmentIdentificationNumber,
        shipmentDate,
        trackingNumber: ShipmentIdentificationNumber,
        rates: ratesData.data.rates,
        createdAt: new Date().toString(),
        label: getLabel
          ? {
              id: ShipmentIdentificationNumber,
              labelUrl: LabelImage.GraphicImage,
              trackingNumbers: [ShipmentIdentificationNumber],
              status: "created",
              createdAt: new Date().toString()
            }
          : null
      }
    };
  }

  if (returnType === "postmen") {
    const {
      id,
      tracking_number: trackingNumber,
      created_at: createdAt,
      rates,
      label
    } = objct;
    return {
      shipment: {
        id,
        trackingNumber,
        createdAt,
        rates: rates.map(rate => ({
          id,
          status: "calculated",
          serviceType: rate.shipper_account.slug,
          deliveryDate: rate.delivery_date,
          totalCharge: {
            ...rate.total_charge
          }
        })),
        label: label
          ? {
              id: label.id,
              status: "created",
              labelUrl: label.labelUrl,
              createdAt: label.createdAt,
              trackingNumbers: label.trackingNumbers
            }
          : null
      }
    };
  }

  if (returnType === "shippo") {
    return {
      shipment: {
        id: objct.object_id,
        trackingNumber: objct?.label?.trackingNumbers[0],
        shipmentDate: objct.shipment_date,
        createdAt: objct.object_created,
        addressReturnId: objct.address_return.object_id,
        rates: objct.rates.map(rate => ({
          id: rate.object_id,
          status: "calculated",
          serviceType: rate.provider,
          deliveryDate: rate.arrivesBy || rate.duration_terms,
          totalCharge: {
            amount: rate.amount,
            currency: rate.currency
          }
        })),
        label: objct.getLabel
          ? {
              id: objct.label.id,
              createdAt: objct.label.createdAt,
              labelUrl: objct.label.labelUrl,
              trackingNumbers: objct.label.trackingNumbers
            }
          : null
      }
    };
  }

  return {};
};

const ratesRequestFormatter = (returnType, objct) => {
  const { shipmentDate } = objct;
  const { shipmentMetadata } = objct;
  const { shipFrom } = objct.shipment;
  const { shipTo } = objct.shipment;
  const { parcels } = objct.shipment;
  const { shipperAccount } = objct;

  if (returnType === "dhl") {
    const formattedObject = {
      ClientDetail: {},
      RequestedShipment: {
        DropOffType: "REGULAR_PICKUP",
        Ship: {
          Shipper: {
            StreetLines: shipFrom.street1,
            City: shipFrom.city,
            PostalCode: shipFrom.postalCode,
            CountryCode: shipFrom.countryCode
          },
          Recipient: {
            StreetLines: shipTo.street1,
            City: shipTo.city,
            PostalCode: shipTo.postalCode,
            CountryCode: shipTo.countryCode
          }
        },
        Packages: {
          RequestedPackages: {
            attributes: {
              number: 1
            },
            Weight: {
              Value: parcels[0].weight.value
            },
            Dimensions: {
              Length: parcels[0].dimension.length,
              Width: parcels[0].dimension.width,
              Height: parcels[0].dimension.height
            }
          }
        },
        ShipTimestamp: getIsoDateTimeGmt(new Date(shipmentDate)),
        UnitOfMeasurement: parcels[0].massUnit === "lb" ? "SI" : "SU",
        Content:
          shipmentMetadata && shipmentMetadata.internationalDetail
            ? shipmentMetadata.internationalDetail.content
            : "NON_DOCUMENTS",
        PaymentInfo: "DDP",
        Account: Number(shipperAccount.accountNumber)
      }
    };

    return {
      formattedObject
    };
  }
  return {};
};

const ratesResponseFormatter = (returnType, objct) => {
  if (returnType === "dhl") {
    return {
      rates: objct.rates.map(rate => ({
        id: rate.attributes.type,
        serviceType: rate.attributes.type,
        status: "calculated",
        totalCharge: {
          amount: rate.TotalNet[0].Amount,
          currency: rate.TotalNet[0].Currency
        },
        deliveryDate: rate.DeliveryTime
      }))
    };
  }
  return {};
};

const labelsResponseFormatter = (returnType, objct) => {
  if (returnType === "postmen") {
    return {
      labels: objct.labels.map(label => ({
        id: label.id,
        status: "created",
        trackingNumbers: label.tracking_numbers,
        labelUrl: label?.files?.label?.url,
        createdAt: label.created_at
      }))
    };
  }

  if (returnType === "shippo") {
    return {
      labels: objct.labels.map(label => ({
        id: label.object_id,
        status: "created",
        createdAt: label.object_created,
        updatedAt: label.object_updated,
        labelUrl: label.label_url,
        trackingNumbers: [label.tracking_number]
      }))
    };
  }

  return {};
};

const labelRequestFormatter = (returnType, objct) => {
  const { shipFrom } = objct.shipment;
  const { shipTo } = objct.shipment;
  const { parcels } = objct.shipment;
  const { serviceType } = objct;
  const { shipperAccount } = objct;

  if (returnType === "postmen") {
    const shipFromCC = isoCountries.alpha2ToAlpha3(shipFrom.countryCode, "en", {
      select: "official"
    });
    const shipToCC = isoCountries.alpha2ToAlpha3(shipTo.countryCode, "en", {
      select: "official"
    });
    const formattedObject = {
      shipment: {
        ship_from: {
          contact_name: shipFrom.contactName,
          street1: shipFrom.street1,
          city: shipFrom.city,
          state: shipFrom.state,
          country: shipFromCC,
          phone: shipFrom.phone,
          email: shipFrom.email,
          postal_code: shipFrom.postalCode
        },
        ship_to: {
          contact_name: shipTo.contactName,
          street1: shipTo.street1,
          city: shipTo.city,
          state: shipTo.state,
          country: shipToCC,
          phone: shipTo.phone,
          email: shipTo.email,
          postal_code: shipTo.postalCode
        },
        parcels: parcels.map(parcel => ({
          box_type: parcel.boxType,
          description: parcel.description,
          weight: parcel.weight,
          dimension: {
            width: parcel.dimension.width,
            height: parcel.dimension.height,
            depth: parcel.dimension.depth,
            unit: parcel.dimension.unit
          },
          items: parcel.items.map(item => ({
            description: item.description,
            origin_country: shipFromCC,
            quantity: item.quantity,
            price: item.price,
            weight: item.weight,
            sku: item.sku
          }))
        }))
      },
      service_type: serviceType,
      shipper_account: {
        id: shipperAccount.id
      },
      billing: {
        paid_by: "shipper"
      },
      customs: {
        billing: {
          paid_by: "recipient"
        },
        purpose: "gift"
      },
      return_shipment: false,
      is_document: false,
      paper_size: "4x6"
    };

    return {
      formattedObject
    };
  }

  if (returnType === "shippo") {
    const formattedObject = {
      shipment: {
        parcels: parcels.map(parcel => ({
          width: parcel.width,
          length: parcel.length,
          height: parcel.height,
          mass_unit: parcel.massUnit,
          distance_unit: parcel.distanceUnit,
          weight: parcel.weight.value.toString()
        })),
        address_from: {
          name: shipFrom.contactName,
          street1: shipFrom.street1,
          city: shipFrom.city,
          state: shipFrom.state,
          zip: shipFrom.postalCode,
          country: shipFrom.countryCode,
          phone: shipFrom.phone,
          email: shipFrom.email,
          company: shipFrom.companyName
        },
        address_to: {
          name: shipTo.contactName,
          street1: shipTo.street1,
          city: shipTo.city,
          state: shipTo.state,
          zip: shipTo.postalCode,
          country: shipTo.countryCode,
          phone: shipTo.phone,
          email: shipTo.email,
          company: shipTo.companyName
        }
      },
      carrier_account: shipperAccount.id,
      servicelevel_token: objct.serviceType
    };
    return {
      formattedObject
    };
  }

  return {};
};

const addressRequestFormatter = (returnType, objct) => {
  if (returnType === "postmen") {
    const countryCode = isoCountries.alpha2ToAlpha3(objct.countryCode, "en", {
      select: "official"
    });
    const formattedObject = {
      country: countryCode,
      contact_name: objct.contactName,
      phone: objct.phone,
      fax: objct.fax,
      email: objct.email,
      company_name: objct.companyName,
      street1: objct.street1,
      street2: objct.street2,
      city: objct.city,
      state: objct.state,
      postal_code: objct.postalCode,
      type: objct.type,
      tax_id: objct.taxId
    };
    return {
      formattedObject
    };
  }

  if (returnType === "shippo") {
    const formattedObject = {
      name: objct.contactName,
      company: objct.companyName,
      street1: objct.street1,
      city: objct.city,
      state: objct.state,
      zip: objct.postalCode,
      country: objct.countryCode,
      phone: objct.phone,
      email: objct.email,
      is_residential: objct.isResidential,
      metadata: objct.metadata
    };

    return {
      formattedObject
    };
  }

  return {};
};

const addressResponseFormatter = (returnType, objct) => {
  if (returnType === "postmen") {
    const formattedResponse = {
      address: {
        country: objct.address.country,
        contactName: objct.address.contact_name,
        phone: objct.address.phone,
        fax: objct.address.fax,
        email: objct.address.email,
        companyName: objct.address.company_name,
        street1: objct.address.street1,
        street2: objct.address.street2,
        street3: objct.address.street3,
        city: objct.address.city,
        state: objct.address.state,
        postalCode: objct.address.postal_code,
        type: objct.address.type,
        taxId: objct.address.tax_id
      },
      status: objct.status,
      createdAt: objct.created_at
    };
    return {
      addressResp: formattedResponse
    };
  }

  if (returnType === "shippo") {
    return {
      address: {
        id: objct.object_id,
        isComplete: objct.is_complete,
        contactName: objct.name,
        street1: objct.street1,
        city: objct.city,
        state: objct.state,
        zip: objct.zip,
        country: objct.country,
        phone: objct.phone,
        email: objct.email,
        validationResults: {
          message: objct.validation_results.message,
          isValid: objct.validation_results.is_valid
        }
      },
      status: objct.validation_results.is_valid
    };
  }

  return {};
};

const trackingRequestFormatter = (returnType, objct) => {
  if (returnType === "postmen") {
    // title: objct.title,
    // smses: objct.smses,
    // emails: objct.emails,
    // order_id: objct.orderId,
    // order_id_path: objct.orderIdPath,
    // order_promised_delivery_date: objct.orderPromisedDeliveryDate,
    // custom_fields: {
    //   product_name: objct.customFields.productName,
    //   product_price: objct.customFields.productPrice
    // },
    const formattedObject = {
      tracking_number: objct.trackingNumber,
      slug: objct.slug,
      delivery_type: objct.deliveryType,
      pickup_location: objct.pickupLocation,
      language: objct.language
    };
    return {
      formattedObject
    };
  }

  return {};
};

const trackingResponseFormatter = (returnType, tracking) => {
  if (returnType === "postmen") {
    return {
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
        courierDestinationCountryIso3: tracking.courier_destination_country_iso3
      }
    };
  }

  if (returnType === "shippo") {
    return {
      tracking: {
        slug: tracking.slug,
        shipFrom: {
          street1: tracking.address_from.street1,
          city: tracking.address_from.city,
          state: tracking.address_from.state,
          zip: tracking.address_from.zip,
          country: tracking.address_from.country
        },
        shipTo: {
          street1: tracking.address_to.street1,
          city: tracking.address_to.city,
          state: tracking.address_to.state,
          zip: tracking.address_to.zip,
          country: tracking.address_to.country
        },
        serviceToken: tracking.servicelevel.token,
        serviceType: tracking.carrier,
        serviceName: tracking.servicelevel.name,
        deliveryType: tracking.servicelevel.token,
        trackingNumber: tracking.tracking_number,
        transaction: tracking.transaction,
        trackingStatus: {
          id: tracking.tracking_status.object_id,
          status: tracking.tracking_status.status,
          statusDetails: tracking.tracking_status.status_details,
          statusDate: tracking.tracking_status.status_date,
          createdAt: tracking.tracking_status.object_created,
          updatedAt: tracking.tracking_status.object_created,
          location: tracking.tracking_status.location
        },
        trackingHistory: tracking.tracking_history.map(history => ({
          status: history.status,
          statusDetails: history.status_details,
          statusDate: history.status_date,
          createdAt: history.object_created,
          updatedAt: history.object_created
        }))
      }
    };
  }

  if (returnType === "dhl") {
    return {
      tracking: {
        status: tracking.AWBInfo.ArrayOfAWBInfoItem[0].Status.ActionStatus,
        trackingNumber: tracking.trackingNumber,
        consigneeName:
          tracking.AWBInfo.ArrayOfAWBInfoItem[0].ShipmentInfo.ConsigneeName,
        shipmentWeight:
          tracking.AWBInfo.ArrayOfAWBInfoItem[0].ShipmentInfo.Weight,
        shipmentDeliveryDate:
          tracking.AWBInfo.ArrayOfAWBInfoItem[0].ShipmentInfo.ShipmentDate,
        shipmentWeightUnit:
          tracking.AWBInfo.ArrayOfAWBInfoItem[0].ShipmentInfo.WeightUnit,
        shipmentPackageCount:
          tracking.AWBInfo.ArrayOfAWBInfoItem[0].ShipmentInfo.Pieces,
        messageTime: tracking.Response.ServiceHeader.MessageTime,
        messageReference: tracking.Response.ServiceHeader.MessageReference,
        destinationServiceArea: {
          ServiceAreaCode:
            tracking.AWBInfo.ArrayOfAWBInfoItem[0].ShipmentInfo
              .DestinationServiceArea.ServiceAreaCode,
          Description:
            tracking.AWBInfo.ArrayOfAWBInfoItem[0].ShipmentInfo
              .DestinationServiceArea.Description,
          FacilityCode:
            tracking.AWBInfo.ArrayOfAWBInfoItem[0].ShipmentInfo
              .DestinationServiceArea.FacilityCode
        }
      }
    };
  }

  return {};
};

const manifestResponseFormatter = (returnType, manifests) => {
  if (returnType === "postmen") {
    return {
      manifests: manifests.map(manifest => ({
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
      }))
    };
  }

  if (returnType === "shippo") {
    return {
      manifests: manifests.map(manifest => ({
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
    };
  }

  return {};
};

export {
  shipmentRequestFormatter,
  shipmentResponseFormatter,
  ratesRequestFormatter,
  ratesResponseFormatter,
  labelsResponseFormatter,
  labelRequestFormatter,
  addressRequestFormatter,
  addressResponseFormatter,
  trackingRequestFormatter,
  trackingResponseFormatter,
  manifestResponseFormatter
};
