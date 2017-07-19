# OpenAPI designer
Design interface for creating OpenAPI (Swagger) specification files.
[Live demo](https://openapi.design/)

## Setup
0. Have a [Node.js](https://nodejs.org/) install that's not way too old (v4+ should work for everything).
1. Install [Aurelia CLI](https://www.npmjs.com/package/aurelia-cli) (`npm install -g aurelia-cli`)
2. Clone this repo (`git clone https://github.com/apinf/open-api-designer.git`)
3. Run npm install in repo directory
4. Build the code (`au build`) and open `index.html` OR run the webserver integrated in Aurelia using `au run` and open the URL that is printed after building (usually `http://localhost:9000`)

### Docker

1. Clone this repo (`git clone https://github.com/apinf/open-api-designer.git`)
2. Run `docker build -t openapi-designer .` in repo directory
3. Run `docker run  -p 8080:80 openapi-designer`
4. App is now accessible at http://localhost:8080/app


## Development Status
[![Throughput Graph](https://graphs.waffle.io/apinf/openapi-designer/throughput.svg)](https://waffle.io/apinf/openapi-designer/metrics)

## Resources
- [OpenAPI Specification](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md)

