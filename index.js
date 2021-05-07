import Shipment from "./controller/shipment"
import { postmenAddress, postmenCalculateRate, postmenManifestReq } from "./data/postmen"

const testFunctions = async () => {
    const results = await Shipment.createManifest('postmen', postmenManifestReq);
    console.log("results", results);
}

testFunctions();