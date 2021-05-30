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
      });
    });
  
    describe('Get postmen labels', function() {
      it('should get labels', async () => {
        const postmenLabels = await resolvers.Query.labels(null, {type: 'postmen'}, envFile);
        expect(postmenLabels[0]).to.have.property('id');
        expect(postmenLabels[0]).to.have.property('status');
        expect(postmenLabels[0]).to.have.property('labelUrl');
        expect(postmenLabels[0]).to.have.property('rate');
        expect(postmenLabels[0].rate).to.have.property('totalCharge');
      });
    });
  
    describe('Validate postmen address', function() {
      it('should validate provided address', async () => {
        const postmenAddy = await resolvers.Mutation.validateAddress(null, {type: 'postmen', address: postmenAddress }, envFile);
        expect(postmenAddy).to.have.property('id');
        expect(postmenAddy).to.have.property('status');
        expect(postmenAddy.status).to.have.be.equal('valid');
        expect(postmenAddy).to.have.property('createdAt');
        expect(postmenAddy).to.have.property('updatedAt');
      });

      it('should not validate address if not provided a body', async () => {
        try {
            await resolvers.Mutation.validateAddress(null, {type: 'postmen', address: {}}, envFile);
        } catch (error){
            const errorInArray = JSON.parse(error.message);
            expect(errorInArray.length).to.be.greaterThan(0);
            expect(errorInArray[0].message).to.be.equal("should have required property 'street1'");
        }
      });
    });
  
    describe('Get postmen manifest', function() {
      it('should not get postmen mainfest details if not provided manifest', async () => {
        try {
            await resolvers.Query.manifest(null, { type: "postmen", manifestId: "jiji" }, envFile) 
        } catch (error){
            const errorInArray = JSON.parse(error.message);
            expect(errorInArray.length).to.be.greaterThan(0);
            expect(errorInArray[0]).to.be.equal("Item does not exist.");
        }
      });
 
      it('should get postmen mainfest details if manifest id is provided', async () => {
        await resolvers.Mutation.createManifest(null, { type: "postmen", manifest: postmenManifestReq }, envFile) 
        const manifests = await resolvers.Query.manifests(null, { type: "postmen" }, envFile);
        const manifest = await resolvers.Query.manifest(null, { type: "postmen", manifestId: manifests[0].id }, envFile)       
        expect(manifest).to.have.property('id');
        expect(manifest).to.have.property('status');
      });
    });

    describe('Cancel/delete postmen label', function() {
        it('should cancel postmen label if not provided label id', async () => {
            const postmenLabel = await resolvers.Mutation.createLabel(null, {
                type: 'postmen',
                label: postmenCreateLabel
            }, envFile);
            const canceledLabel = await resolvers.Mutation.cancelOrDeleteLabel(null, { type: "postmen", labelId: postmenLabel.id }, envFile);
            expect(canceledLabel).to.have.property('id');
            expect(canceledLabel).to.have.property('status');
            expect(canceledLabel.status).to.be.equal('cancelled');
        });

       it('should not cancel postmen label if not provided label id', async () => {
        try {
            await resolvers.Mutation.cancelOrDeleteLabel(null, { type: "postmen", labelId: "as" }, envFile) 
        } catch (error){
            const errorInArray = JSON.parse(error.message);
            expect(errorInArray.length).to.be.greaterThan(0);
            expect(errorInArray[0]).to.be.equal("Item not found");
        }
      });
    });
  
    describe('Get postmen tracking status', function() {
      it('should not get postmen tracking status when not provided with a slug/tracking id', async () => {
        try {
            await resolvers.Query.trackingStatus(null, { type: "postmen", tracking: {} }, envFile);
        } catch (error){
            const errorInArray = JSON.parse(error.message);
            expect(errorInArray.length).to.be.greaterThan(0);
            expect(errorInArray[0].message).to.be.equal("should have required property 'trackingNumber'")
        }
      });
    });
  });