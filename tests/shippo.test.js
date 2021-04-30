import chai from 'chai';
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