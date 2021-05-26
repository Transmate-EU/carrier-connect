const { expect } =require ('chai');

let api ; 


console.log("test api");
if (process.env.WEBPACK_TEST) {
  api = require("../../dist/graphql-local.js");
  console.log("webpack test", "api", api);

} else {
  api = require("../../functions/graphql.js");
  console.log("normal test", "api", api);
}

describe('Testing serverless graphql', function () {
  it('shipments should return empty', async () => {
    const result = await api.gqlResolve({ query: "{shipments(type:postmen){id}}"})
    expect(result).to.be.an("object").to.eql({ "data": { "shipments": [] } });
  });
})

