# carrier-connect
module to connect to carriers and get back labels
using 
- goShippo
- postmen
- easypost

# to do
- make schema for requests (use ajv check)
- connect with 
  - easypost
  - postmen
  - goShippo
- implement
  - get rates
  - get labels
  - get manifest
  - delete label
  - tracking

always return
- result obj 
- warnings  = []
- errors = []

use postgress as db if needed (try to do witout)


