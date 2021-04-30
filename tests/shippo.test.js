import chai from 'chai';
<<<<<<< HEAD

import { shippoShipment, shippoAddress, shippoShipmentTesting, shippoLabelCreation } from '../data/shippo';
import resolvers from '../resolvers/resolvers';
const envFile = require("../.env.json");
const { expect } = chai;

describe('Testing goshippo Resolvers', function() {
    let shippoRate;
    let shippoLabel; 

    describe('Get goshippo rates', function() {
        it('should create shipment and get rates', async () => {
            const shipmentObj = await resolvers.Mutation.createShipment(null, 
                { 
                    type: "shippo",
                    shipment: shippoShipmentTesting
                },
                envFile
            );
            const shippoRates = await resolvers.Query.rates(null, {type: 'shippo', shipment: { shipmentId: shipmentObj.id }}, envFile);
            
            shippoRate = shippoRates[0];
            expect(shipmentObj).to.have.property('id');
            expect(shipmentObj).to.have.property('createdAt');
            expect(shipmentObj).to.have.property('rates');
            expect(shippoRates[0]).to.have.property('totalCharge');
            expect(shippoRates[0]).to.have.property('serviceType');
            expect(shippoRates[0].totalCharge).to.have.property('currency');
            expect(shippoRates[0].totalCharge).to.have.property('amount');
        });
        it('should not get rates when a shipment id does not exist', async () => {
            try {
                await resolvers.Query.rates(null, {type: 'shippo', shipment: { shipmentId: "898999999989898980ok" }}, envFile);
            } catch (error){
                const errorInArray = JSON.parse(error.message);
                expect(error).to.have.property('message');
                expect(errorInArray[0]).to.be.equal("Invalid JSON received from the Shippo API");
            }
        });
        it('should not get rates when a shipment is not provided', async () => {
            try {
                await resolvers.Query.rates(null, {type: 'shippo', shipment: { shipmentId: "" }}, envFile);
            } catch (error){
                const errorInArray = JSON.parse(error.message);
                expect(error).to.have.property('message');
                expect(errorInArray[0]).to.be.equal("Please provide shipment id");
            }
        });
    });

    describe('Get goshippo labels', function() {
        it('should get labels', async () => {
            shippoLabel = await resolvers.Mutation.createLabel(null, { 
                type: "shippo",
                label: {
                    rate: shippoRate.id
                },
                envFile
            });
            const shippoLabels = await resolvers.Query.labels(null, {type: 'shippo'}, envFile);
            expect(shippoLabels[0]).to.have.property('id');
            expect(shippoLabels[0]).to.have.property('status');
            expect(shippoLabels[0]).to.have.property('trackingNumbers');
        });
    });

    describe('Get goshippo validate address', function() {
        it('should create and  validate address', async () => {
            const address = await resolvers.Mutation.createAddress(null, { type: 'shippo', address: shippoAddress }, envFile);
            const shippoValidatedAddress =  await resolvers.Mutation.validateAddress(null, { type: 'shippo', address: { id: address.id } }, envFile);
            expect(address).to.have.property('id');
            expect(address).to.have.property('isComplete');
            expect(shippoValidatedAddress.isComplete).to.have.be.equal(true);
            expect(shippoValidatedAddress.validationResults).to.have.property('isValid');
            expect(shippoValidatedAddress.validationResults.isValid).to.have.be.equal(true);
        });

        it('should not create address when address body is not provided', async () => {
            try {
                await resolvers.Mutation.createAddress(null, { type: 'shippo', address: {}}, envFile);
            } catch (error) {
                const errorInArray = JSON.parse(error.message);
                expect(errorInArray.length).to.be.greaterThan(0);
                expect(errorInArray[0].message).to.be.equal("should have required property 'street1'");
            }
        });

        it('should not validate address when wrong address id is provided', async () => {
            try {
                await resolvers.Mutation.validateAddress(null, { type: 'shippo', address: { id: 'sjsjsjs' }}, envFile);
            } catch (error) {
                const errorInArray = JSON.parse(error.message); 
                expect(errorInArray.length).to.be.greaterThan(0);
                expect(errorInArray[0]).to.be.equal("Invalid JSON received from the Shippo API");
            }
        });
    });

    describe('Get goshippo manifest', function() {
        it('should not get goshippo mainfest details if not provided manifest', async () => {
            try {
                await resolvers.Query.manifest(null, { type: 'shippo', manifest: {}}, envFile);
            } catch (error) {
                const errorInArray = JSON.parse(error.message);
                expect(errorInArray.length).to.have.to.be.greaterThan(0);
                expect(errorInArray[0]).to.be.equal('Shippo: I require argument "id", but I got: undefined');
            }
        });
    });

    describe('Get goshippo tracking status', function() {
        it('should not get goshippo tracking status when not provided with a slug/tracking id', async () => {
            try {
                await resolvers.Query.trackingStatus(null, { type: 'shippo', tracking: {}}, envFile);
            } catch (error){
                const errorInArray = JSON.parse(error.message);
                expect(errorInArray.length).to.have.to.be.greaterThan(0);
                expect(errorInArray[0].detail).to.be.equal('Carrier with name undefined is not supported.');
            }
        });
        it('should get goshippo tracking status when provided with a slug and tracking number', async () => {
            const tracking = await resolvers.Query.trackingStatus(null, { type: 'shippo', tracking: {
                trackingNumber: "SHIPPO_DELIVERED",
                trackingSlug: "shippo" 
            }}, envFile);
            expect(tracking).to.have.property('trackingStatus');
            expect(tracking.trackingStatus.status).to.be.equal('DELIVERED')
        });
    });

    describe('Refund/Cancel label', function() {
        it('should create and cancel label when provided label id', async () => {
            const canceledLabel = await resolvers.Mutation.cancelOrDeleteLabel(null, { type: 'shippo', labelId: shippoLabel.id }, envFile);
            expect(canceledLabel).to.have.property('id');
            expect(canceledLabel).to.have.property('status');
            expect(canceledLabel.status).to.be.equal('QUEUED');
        });
        it('should not cancel goshippo label if wrong id is provided', async () => {
            try {
                await resolvers.Mutation.cancelOrDeleteLabel(null, { type: 'shippo', labelId: 'label.id' }, envFile);
            } catch (error){
                const errorInArray = JSON.parse(error.message);
                expect(errorInArray.length).to.have.to.be.greaterThan(0);
                expect(errorInArray[0].transaction[0]).to.be.equal('Transaction with supplied object_id not found.');
            }
        });  
    });
});
=======
import Shipment from '../controller/shipment';
import { shippoShipment, shippoAddress } from '../data/shippo';

const { expect } = chai;

describe('Testing goshippo API', function() {
  describe('Get goshippo rates', function() {
    it('should get rates when a shipment is provided', async () => {
      const shipmentObj = await Shipment.createShipment('shippo', shippoShipment);
      const shippoFetchRates = await Shipment.getRates('shippo', shipmentObj.data.object_id);
      expect(shippoFetchRates.data).to.have.property('results');
      expect(shippoFetchRates.data.results.length).to.be.greaterThan(0);
    });
    it('should not get rates when a shipment is not provided', async () => {
      const shippoFetchRates = await Shipment.getRates('shippo'); 
      expect(shippoFetchRates).to.have.property('errors');
    });
  });

  describe('Get goshippo labels', function() {
    it('should get labels', async () => {
      const shippoFetchLabels = await Shipment.getLabels('shippo');
      expect(shippoFetchLabels.data).to.have.property('results');
      expect(shippoFetchLabels.data.results.length).to.be.greaterThan(0);
    });
  });

  describe('Get goshippo validate address', function() {
    it('should validate address', async () => {
      const address = await Shipment.createAddress('shippo', shippoAddress);
      const shippoAddy = await Shipment.validateAddress('shippo', address.data.object_id);
      expect(shippoAddy.data).to.have.property('object_id');
      expect(shippoAddy.data).to.have.property('object_owner');
    });

    it('should not validate address when not supplied an address', async () => {
      const shippoAddy = await Shipment.validateAddress('shippo');
      expect(shippoAddy).to.have.property('errors');
      expect(shippoAddy.errors.length).to.have.to.be.greaterThan(0);
    });
  });

  describe('Get goshippo manifest', function() {
    it('should not get goshippo mainfest details if not provided manifest', async () => {
      const shippoManifest = await Shipment.getManifest('shippo');
      expect(shippoManifest).to.have.property('errors');
      expect(shippoManifest.errors.length).to.have.to.be.greaterThan(0);
    });
  });

  describe('Get goshippo tracking status', function() {
    it('should not get goshippo tracking status when not provided with a slug/tracking id', async () => {
      const shippoTracking = await Shipment.getTracking('shippo',);
      expect(shippoTracking).to.have.property('errors');
      expect(shippoTracking.errors.length).to.have.to.be.greaterThan(0);
    });
  });
});
>>>>>>> Create item.js
