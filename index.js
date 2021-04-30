// import moment from 'moment';
// import shipment from './controller/shipment';
// import { postmanTrackingObj } from './data/postmen';
// import { 
//     shippoCarrierAccount,
//     shippoManifest,
//     postmenShipperAccount,
//     shippoTransaction,
//     shippoShipment,
//     shippoAddress,
//     postmenAddress
// } from './data/shippo';

// // get shippo manifests
// const getShippoManifest = async () => {
//     try {
//         const shippoCarrierAcc = await shipment.createCarrierAccount('shippo', shippoCarrierAccount);
//         const shippoCreateLabel = await shipment.createLabel('shippo', {...shippoTransaction, carrier_account: shippoCarrierAcc.object_id});
//         const shippoCreateManifest = await shipment.createManifest('shippo', {
//             shipment_date: moment().format('2021-05-16T23:59:59Z'),
//             carrier_account: shippoCarrierAcc.object_id,
//             transactions: [shippoCreateLabel.object_id]
//         });
//         const shippoGetManifest = await shipment.getManifest('shippo', shippoCreateManifest.object_id);
//         console.log("shippoGetManifest", shippoGetManifest);
//     } catch (error) {
//         console.log("error", error);
//     }
// }

// const createShippoManifest = async () => {
//     try {
//         const shippoCreateManifest = await shipment.createManifest('shippo', {
//             address_from: "",
//             shipment_date: moment().format('2021-05-16T23:59:59Z'),
//             carrier_account: "shippoCarrierAcc.object_id"
//         });
//         console.log("shippoGetManifest", shippoCreateManifest);
//     } catch (error) {
//         console.log("error", error);
//     }
// }

// const deleteShippoLabel = async () => {
//     try {
//         const shippoCarrierAcc = await shipment.createCarrierAccount('shippo', shippoCarrierAccount);
//         const shippoCreateLabel = await shipment.createLabel('shippo', {
//             ...shippoTransaction, 
//             carrier_account: shippoCarrierAcc.object_id
//         });
//         console.log("label", shippoCreateLabel);
//     } catch (error) {
//         console.log("error", error);
//     }
// }

// const shippoFetchRates = async () => {
//     try {
//         const shipmentObj = await shipment.createShipment('shippo', shippoShipment);
//         const shippoFetchRates = await shipment.getRates('shippo', shipmentObj.object_id);
//         console.log("shippoFetchRates", shippoFetchRates);
//     } catch (error){
//         console.log("error", error);
//     }
// }

// const shippoFetchLabels = async () => {
//     try {

//         const shippoFetchLabels = await shipment.getLabels('shippo');
//         console.log("shippoFetchLabels", shippoFetchLabels)
//     } catch (error){
//         console.log("error", error);
//     }
// }

// const shippoValidateAddress = async () => {
//     try {
//         const addressShippo = await shipment.createAddress('shippo', shippoAddress)
//         const address = await shipment.validateAddress('shippo', addressShippo.object_id);
//         console.log("address", address);
//     } catch (error){
//         console.log("error", error);
//     }
// }

// const shippoGetShipmentStatus = async () => {
//     try {
//         const tracking = await shipment.getTracking('shippo', { 
//             carrier: 'usps',
//             trackingNumber: 9205590164917312751089
//         });
//         console.log("tracking", tracking)
//     } catch (error){
//         console.log("error", error);
//     }
// }

// const postmentRates = async () => {
//     try {
//         const postmenFetchRates = await shipment.getRates('postmen');
//         console.log("postmenFetchRates", postmenFetchRates);
//     } catch (error) {
//         console.log("error", error);
//     }
// }

// const postmenLabels = async () => {
//     try {
//         const postmenFetchLabels = await shipment.getLabels('postmen');
//         console.log("postmenFetchRates", postmenFetchLabels);
//     } catch (error) {
//         console.log("error", error);
//     }
// }

// const postmenGetManifest = async () => {
//     try {
//         const postmenFetchManifests = await shipment.getManifest('postmen');
//         console.log("postmenFetchManifests", postmenFetchManifests)
//     } catch (error){
//         console.log("error", error);
//     }
// }


// const postmentDeleteManifest = async () => {
//     try {
//         const postmenCancelLabel = await shipment.deleteLabel('postmen', "00000000-0000-0000-0000-000000000000");
//         console.log("postmenFetchManifests", postmenCancelLabel)
//     } catch (error){
//         console.log("error", error);
//     }
// }

// const postmenGetTrackings = async () => {
//     try {
//         const postmenTrackings = await shipment.getTrackings('postmen');
//         console.log("postmenTrackings", postmenTrackings);
//     } catch (error){
//         console.log("error", error);
//     }
// }

// const postmenCreateTracking = async () => {
//     try {
//         const postmenTracking = await shipment.createTracking('postmen', { tracking: postmanTrackingObj });
//         console.log("postmenTracking", postmenTracking);
//     } catch (error){
//         console.log("error", error);
//     }
// }

// const postmenGetTracking = async () => {
//     try {
//         const postmenTrackings = await shipment.getTrackings('postmen');
//         const postmenTracking = await shipment.getTracking('postmen', { 
//             trackingId: postmenTrackings.data.trackings[0].id,
//             trackingSlug: postmenTrackings.data.trackings[0].slug
//         });
//         console.log("postmenTracking", postmenTracking.errors);
//     } catch (error){
//         console.log("error", error);
//     }
// }

// const postmenCreateCarrieAccount = async () => {
//     try {
//         const carrieAccount = await shipment.createCarrierAccount('postmen', postmenShipperAccount);
//         console.log("carrieAccount", carrieAccount)
//     } catch (error){
//         console.log("error", error);
//     }
// }

// const postmenValidateAddress = async () => {
//     try {
//         const address = await shipment.validateAddress('postmen', {address: postmenAddress});
//         console.log("address", address);
//     } catch (error){
//         console.log("error", error);
//     }
// }

// const postmenGetAllManifests = async () => {
//     try {
//         const manifests = await shipment.getAllManifests('postmen');
//         console.log("manifests", manifests.data);
//     } catch (error){
//         console.log("error", error);
//     }
// }

// const postmenCreateManifest = async () => {
//     try {
//         const manifest = await shipment.createManifest('postmen', {
//             async: false,
//             shipper_account:{
//                 id: "3ba41ff5-59a7-4ff0-8333-64a4375c7f21"
//             }
//         });
//         console.log("manifest", manifest);
//     } catch (error){
//         console.log("error", error);
//     }
// }

// const shippoCreateAddress = async () => {
//     try {
//         const addressShippo = await shipment.createAddress('shippo', shippoAddress)
//         console.log("object", addressShippo);
//     } catch (error){
//         console.log("error", error);
//     }
// }

// // const shippoCreateAddress = shipment.createAddress('shippo', shippoAddress);
// // const shippoCreateShipment = shipment.createShipment('shippo',shippoShipment);
// // const shippoCreateLabel = shipment.createLabel('shippo', shippoTransaction);
// // const shippoValidateAddress = shipment.validateAddress('shippo', 'd799c2679e644279b59fe661ac8fa488');
// // const postmenFetchRates = shipment.getRates('postment');

// // call functions here
// // getShippoManifest()
// // deleteShippoLabel();
// // shippoFetchLabels();
// // shippoValidateAddress()
// // shippoGetShipmentStatus()
// // postmentRates();
// // postmenGetManifest();
// // postmentDeleteManifest();
// // postmenGetTrackings()
// // postmenCreateTracking()
// // postmenGetTracking();
// // postmenCreateCarrieAccount();
// // postmenValidateAddress();
// // postmenCreateManifest();
// // postmenGetAllManifests()
// // createShippoManifest();
// shippoCreateAddress()