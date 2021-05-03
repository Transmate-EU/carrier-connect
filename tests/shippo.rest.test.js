import api from '../functions/api';
import chai from 'chai';
import env from '../env.json';
import { 
    shippoAddress,
    shippoShipmentTesting,
    shippoLabelCreation
 } from '../data/shippo';

const { expect } = chai;

describe("Test postmen API", function () {
    describe('should test(labels, ratings, manifest and shipments)', function() {
        let shippoShipment;
        let shippoLabel;
        let address;

        it('should create shipment', async () => {
            const response = await api.main({
                ...env,
                type: 'createShipment', 
                request: {
                    type: 'shippo',
                    shipment: shippoShipmentTesting
                }
            });

            shippoShipment = response.body.result;
            expect(shippoShipment).to.have.property('id');
            expect(shippoShipment).to.have.property('status');
            expect(shippoShipment.status).to.be.equal('QUEUED');
            expect(response.statusCode).to.be.equal(200);
        }); 

        it('should calculate rate', async () => {
            const response = await api.main({
                ...env,
                type: 'ratings', 
                request: {
                    type: 'shippo',
                    shipment: { shipmentId: shippoShipment.id }
                }
            });

            expect(response.body.result[0]).to.have.property('id');
            expect(response.body.result[0]).to.have.property('serviceType');
            expect(response.body.result[0]).to.have.property('serviceName');
            expect(response.statusCode).to.be.equal(200);
        });

        it('should create label', async () => {
            const response = await api.main({
                ...env,
                type: 'createLabel', 
                request: {
                    type: 'shippo',
                    label: shippoLabelCreation
                }
            });

            shippoLabel = response.body.result;
            expect(shippoLabel).to.have.property('id');
            expect(shippoLabel).to.have.property('status');
            expect(shippoLabel).to.have.property('rate');
            expect(response.statusCode).to.be.equal(200);
        });

        it('should create address', async () => {
            const response = await api.main({
                ...env,
                type: 'createAddress', 
                request: {
                    type: 'shippo',
                    address: shippoAddress
                }
            });

            address = response.body.result;

            expect(address).to.have.property('id');
            expect(address).to.have.property('isComplete');
            expect(response.statusCode).to.be.equal(200);
        });

        it('should validate address', async () => {
            const response = await api.main({
                ...env,
                type: 'validateAddress', 
                request: {
                    type: 'shippo',
                    address: { id: address.id }
                }
            });

            expect(response.body.result).to.have.property('id');
            expect(response.body.result).to.have.property('isComplete');
            expect(response.body.result.validationResults.isValid).to.be.equal(true);
        });

        it('should refund/cancel label', async () => {
            const response = await api.main({
                ...env,
                type: 'cancelOrDeleteLabel', 
                request: {
                    type: 'shippo',
                    labelId: shippoLabel.id
                }
            });

            expect(response.body.result).to.have.property('id');
            expect(response.body.result).to.have.property('status');
            expect(response.body.result).to.have.property('transaction');
        });

        it('should get tracking status label', async () => {
            const response = await api.main({
                ...env,
                type: 'trackingStatus', 
                request: {
                    type: 'shippo',
                    tracking: {
                        trackingNumber: "SHIPPO_DELIVERED",
                        trackingSlug: "shippo" 
                    }
                }
            });

            expect(response.body.result).to.have.property('deliveryType');
            expect(response.body.result).to.have.property('serviceToken');
            expect(response.body.result).to.have.property('serviceType');
        });
    })
})