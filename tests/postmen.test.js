import chai from 'chai';
import Shipment from '../controller/shipment';

import { 
    postmenAddress,
    postmenCalculateRate,
    postmenCreateLabel,
    postmenManifestReq,
    postmenTracking
} from '../data/postmen';
import resolvers from '../resolvers/resolvers';
import { envFile } from './test.data';

const { expect } = chai;

describe('Testing postmen Resolvers', function() {
    describe('Get postmen rates', function() {
      it('should get all rates', async () => {
        const postmenRates = await resolvers.Query.rates(null, {type: 'postmen', shipment: postmenCalculateRate}, envFile);
        expect(postmenRates[0]).to.have.property('chargeWeight');
        expect(postmenRates[0]).to.have.property('totalCharge');
        expect(postmenRates[0].totalCharge).to.have.property('amount');
        expect(postmenRates[0].totalCharge).to.have.property('currency');
        expect(postmenRates[0].totalCharge.currency).to.be.equal('USD');
      });
      it('should not get all rates when not provided shipment', async () => {
        try {
            await resolvers.Query.rates(null, {type: 'postmen', shipment: {}}, envFile);
        } catch (error){
            const errorInArray = JSON.parse(error.message);
            expect(errorInArray.length).to.have.to.be.greaterThan(0);
            expect(errorInArray[0]).to.be.equal("Cannot read property 'shipFrom' of undefined");
        }  
      });
    });

    describe('Get postmen labels', function() {
      it('should create label', async () => {
        const postmenLabel = await resolvers.Mutation.createLabel(null, {type: 'postmen', label: postmenCreateLabel}, envFile);
        expect(postmenLabel).to.have.property('id');
        expect(postmenLabel).to.have.property('status');
        expect(postmenLabel).to.have.property('trackingNumbers');
        expect(postmenLabel.status).to.be.equal('created');
      });
      it('should not create label if shipFrom is not provided', async () => {
        try {
            await resolvers.Mutation.createLabel(null, {type: 'postmen', label: {}}, envFile);
        } catch (error){
            const errorInArray = JSON.parse(error.message);
            expect(errorInArray.length).to.be.greaterThan(0);
            expect(errorInArray[0]).to.be.equal("Cannot read property 'shipFrom' of undefined");
        }
describe('Testing postmen API', function() {
    describe('Get postmen rates', function() {
      it('should get all rates', async () => {
        const postmenFetchRates = await Shipment.getRates('postmen');
        expect(postmenFetchRates.data).to.have.property('rates');
      });
    });
  
    describe('Get postmen labels', function() {
      it('should get labels', async () => {
        const postmenFetchLabels = await Shipment.getLabels('postmen');
        expect(postmenFetchLabels.data).to.have.property('labels');
      });
    });
  
    describe('Validate postmen address', function() {
      it('should validate provided address', async () => {
        const postmenAddy = await Shipment.validateAddress('postmen', {address: postmenAddress}); 
        expect(postmenAddy.data).to.have.property('meta');
        expect(postmenAddy.data.data).to.have.property('id');
        expect(postmenAddy.data.meta).to.have.property('code');
      });

      it('should not validate address if not provided a body', async () => {
        const postmenAddy = await Shipment.validateAddress('postmen'); 
        expect(postmenAddy).to.have.property('errors');
        expect(postmenAddy.data).to.have.property('meta');
        expect(postmenAddy.data.meta.message).to.have.equal('The request was invalid or cannot be otherwise served.');
      });
    });
  
    describe('Get postmen manifest', function() {
      it('should not get postmen mainfest details if not provided manifest', async () => {
        const postmenManifest = await Shipment.getManifest('postmen');
        expect(postmenManifest).to.have.property('errors');
      });

      it('should get postmen mainfest details if manifest id is provided', async () => {
        const postmenManifests = await Shipment.getAllManifests('postmen');
        const postmenManifest = await Shipment.getManifest('postmen', postmenManifests.data.data.manifests[0].id);
        expect(postmenManifest.data).to.have.property('meta');
        expect(postmenManifest.data.data).to.have.property('id');
        expect(postmenManifest.data.meta).to.have.property('code');
      });
    });

    describe('Cancel/delete postmen label', function() {
      it('should not cancel postmen label if not provided label id', async () => {
        const postmenLabel = await Shipment.deleteLabel('postmen');
        expect(postmenLabel).to.have.property('errors');
      });
    });
  
    describe('Get postmen tracking status', function() {
      it('should not get postmen tracking status when not provided with a slug/tracking id', async () => {
        const postmenTracking = await Shipment.getTracking('postmen');
        expect(postmenTracking).to.have.property('errors');
        expect(postmenTracking.errors.length).to.be.greaterThan(0);
      });

      it('should not get postmen tracking status when testing', async () => {
        const trackings = await Shipment.getTrackings('postmen');
        const postmenTracking = await Shipment.getTracking('postmen', { 
          trackingId: trackings.data.trackings[0].id,
          trackingSlug: trackings.data.trackings[0].slug
        });
        expect(postmenTracking).to.have.property('errors');
        expect(postmenTracking.errors[0]).to.have.property('meta');
        expect(postmenTracking.errors[0].meta).to.have.property('message');
      });
    });
  });