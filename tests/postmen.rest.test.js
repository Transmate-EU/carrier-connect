import api from '../functions/api';
import chai from 'chai';
import env from '../env.json';
import { 
    postmenCalculateRate,
    postmenCreateLabel,
    postmenManifestReq,
} from '../data/postmen'
import dotenv from 'dotenv'

dotenv.config()
const { expect } = chai;

describe("Test postmen API", function () {
    describe('should test(labels, ratings, manifest and shipments)', function() {
        let postmenLabel;
        let postmenLabels;
        let postmenManifest;

        it('should create label', async () => {
            const response = await api.main({
                ...env,
                type: 'createLabel', 
                request: {
                    type: 'postmen',
                    label: postmenCreateLabel
                }
            });
            postmenLabel = response.body.result;
            expect(postmenLabel).to.have.property('id');
            expect(postmenLabel).to.have.property('status');
            expect(postmenLabel.status).to.be.equal('created');
            expect(response.statusCode).to.be.equal(200);
        }); 

        it ('should get labels', async () => {
            const response = await api.main({
                ...env,
                type: 'labels', 
                request: {
                    type: 'postmen'
                }
            });

            postmenLabels = response.body.result;
            expect(postmenLabels[0]).to.have.property('id');
            expect(postmenLabels[0]).to.have.property('status');
            expect(postmenLabels[0]).to.have.property('rate');
            expect(postmenLabels[0].rate).to.have.property('totalCharge');
            expect(response.statusCode).to.be.equal(200);
        })

        it ('should cancel label', async () => {
            const response = await api.main({
                ...env,
                type: 'cancelOrDeleteLabel', 
                request: {
                    type: 'postmen',
                    labelId: postmenLabel.id
                }
            });

            expect(response.body.result).to.have.property('id');
            expect(response.body.result).to.have.property('status');
            expect(response.body.result.status).to.be.equal('cancelled');
            expect(response.statusCode).to.be.equal(200);
        })

        it ('should calculate rates given a shipment', async () => {
            const response = await api.main({
                ...env,
                type: 'ratings', 
                request: {
                    type: 'postmen',
                    shipment: postmenCalculateRate
                }
            });

            expect(response.body.result[0]).to.have.property('chargeWeight');
            expect(response.body.result[0]).to.have.property('totalCharge');
            expect(response.body.result[0].totalCharge).to.have.property('amount');
            expect(response.statusCode).to.be.equal(200);
        })

        it ('should create manifest', async () => {
            const response = await api.main({
                ...env,
                type: 'createManifest', 
                request: {
                    type: 'postmen',
                    manifest: postmenManifestReq
                }
            });

            postmenManifest = response.body.result;
            expect(postmenManifest).to.have.property('id');
            expect(postmenManifest).to.have.property('status');
            expect(postmenManifest).to.have.property('createdAt');
            expect(response.statusCode).to.be.equal(200);
        })

        it ('should get created manifest', async () => {
            const response = await api.main({
                ...env,
                type: 'manifest', 
                request: {
                    type: 'postmen',
                    manifestId: postmenManifest.id
                }
            });

            expect(response.body.result).to.have.property('id');
            expect(response.body.result).to.have.property('status');
            expect(response.body.result).to.have.property('createdAt');
            expect(response.statusCode).to.be.equal(200);
        });
    })
})