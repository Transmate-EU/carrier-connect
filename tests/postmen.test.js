import chai from 'chai';
import Shipment from '../controller/shipment';
import { postmenAddress, postmenCalculateRate, postmenManifestReq } from '../data/postmen';
import dotenv from 'dotenv';

dotenv.config();
const { expect } = chai;

describe('Testing postmen API', function() {
    describe('Get postmen rates', function() {
      it('should get all rates', async () => {
        const postmenFetchRates = await Shipment.getRates('postmen', postmenCalculateRate);
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
        const postmenAddy = await Shipment.validateAddress('postmen', { address: postmenAddress }); 
        expect(postmenAddy.data).to.have.property('meta');
        expect(postmenAddy.data.data).to.have.property('id');
        expect(postmenAddy.data.meta).to.have.property('code');
      });

      it('should not validate address if not provided a body', async () => {
        const postmenAddy = await Shipment.validateAddress('postmen'); 
        expect(postmenAddy).to.have.property('errors');
        expect(postmenAddy.errors.length).to.be.greaterThan(0);
      });
    });
  
    describe('Get postmen manifest', function() {
      it('should not get postmen mainfest details if not provided manifest', async () => {
        const postmenManifest = await Shipment.getManifest('postmen');
        expect(postmenManifest).to.have.property('errors');
      });

      it('should get postmen mainfest details if manifest id is provided', async () => {
        let postmenManifest
        
        const manifests = await Shipment.getAllManifests('postmen');

        if (manifests.data.data.manifests.length > 0) {
          postmenManifest = await Shipment.getManifest('postmen', manifests.data.data.manifests[0].id);
        }

        if (manifests.data.data.manifests.length === 0){
          const manifest = await Shipment.createManifest('postmen', postmenManifestReq);
          postmenManifest = await Shipment.getManifest('postmen', manifest.data.data.id);
        }
        
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