const soap = require("soap");
const format = require("xml-formatter");
const { lookup } = require("country-data");

function wsdlRequest(wsdlUrl, method, auth, req) {
  return new Promise((resolve, reject) => {
    const res = {};
    soap.createClient(wsdlUrl, (err, client) => {
      if (auth.username === undefined) {
        throw Error("No username specified");
      }

      if (auth.password === undefined) {
        throw Error("No password specified");
      }

      const wsSecurity = new soap.WSSecurity(auth.username, auth.password);
      client.setSecurity(wsSecurity);

      client.on("response", responseXml => {
        res.responseXml = responseXml;
      });

      let clientMethod = client[method];
      if (method === "PickUpRequest") {
        clientMethod =
          clientMethod.euExpressRateBook_providerServices_PickUpRequest_Port
            .PickUpRequest;
      }

      clientMethod(req, (err, response) => {
        if (err) {
          reject(err);
        }
        res.response = response;
        resolve(res);
      });

      res.requestXml = format(client.lastRequest);
    });
  });
}

const liveUrlPrefix = "https://wsbexpress.dhl.com/gbl";
const testUrlPrefix = "https://wsbexpress.dhl.com/sndpt";
const liveExpressRateBookUrl = `${liveUrlPrefix}/expressRateBook?WSDL`;
const testExpressRateBookUrl = `${testUrlPrefix}/expressRateBook?WSDL`;

module.exports = {
  rateRequest(auth, req) {
    return wsdlRequest(liveExpressRateBookUrl, "getRateRequest", auth, req);
  },
  requestPickup(auth, req) {
    return wsdlRequest(
      `${liveUrlPrefix}/requestPickup?WSDL`,
      "PickUpRequest",
      auth,
      req
    );
  },
  shipmentRequest(auth, req) {
    return wsdlRequest(
      liveExpressRateBookUrl,
      "createShipmentRequest",
      auth,
      req
    );
  },
  trackingRequest(auth, req) {
    return wsdlRequest(
      `${liveUrlPrefix}/glDHLExpressTrack?WSDL`,
      "trackShipmentRequest",
      auth,
      req
    );
  },
  testRateRequest(auth, req) {
    return wsdlRequest(testExpressRateBookUrl, "getRateRequest", auth, req);
  },
  testRequestPickup(auth, req) {
    return wsdlRequest(
      `${testUrlPrefix}/requestPickup?WSDL`,
      "PickUpRequest",
      auth,
      req
    );
  },
  testShipmentRequest(auth, req) {
    return wsdlRequest(
      testExpressRateBookUrl,
      "createShipmentRequest",
      auth,
      req
    );
  },
  testTrackingRequest(auth, req) {
    return wsdlRequest(
      `${testUrlPrefix}/glDHLExpressTrack?WSDL`,
      "trackShipmentRequest",
      auth,
      req
    );
  },
  getIsoDateTime() {
    return new Date().toISOString();
  },
  getIsoDateTimeGmt(dateParam) {
    const date = dateParam || new Date();
    const offset = date.getTimezoneOffset();
    const offsetAbs = Math.abs(offset);
    const offsetSign = offset / offsetAbs;
    const offsetSignChar = offsetSign < 0 ? "-" : "+";
    const offsetHoursAbs = Math.floor(offsetAbs / 60);
    const offsetMinutesAbs = offsetAbs % 60;
    return `${date.getUTCFullYear()}-\
${(date.getUTCMonth() + 1).toString().padStart(2, 0)}-\
${date.getUTCDate().toString().padStart(2, 0)}T\
${date.getUTCHours().toString().padStart(2, 0)}:\
${date.getUTCMinutes().toString().padStart(2, 0)}:\
${date.getUTCSeconds().toString().padStart(2, 0)}GMT\
${offsetSignChar}\
${offsetHoursAbs.toString().padStart(2, 0)}:\
${offsetMinutesAbs.toString().padStart(2, 0)}`;
  },
  getMessageReference() {
    return Array(32)
      .fill(0)
      .map(() => Math.random().toString(36).charAt(2))
      .join("");
  },
  countryToCode(country) {
    if (country === "Vietnam") {
      // eslint-disable-next-line no-param-reassign
      country = "Viet Nam";
    }
    return lookup.countries({ name: country })[0].alpha2;
  }
};
