import { expect } from 'chai';

const { main } = require("../../functions/graphql.js")


describe('Testing serverless graphql', function () {
  it('shipments should return empty', async () => {
    const result = await main({ query: '{shipments(type:postmen){id}}' })
    expect(result).to.be.an("object").to.eql({ "data": { "shipments": [] } });
  });
})

