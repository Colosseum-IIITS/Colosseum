const swaggerJsDoc = require("swagger-jsdoc");
const path = require("path");

const swaggerOptions = {
  definition: {
    openapi: "3.1.0",
    info: {
      title: "Colloseum API's",
      version: "1.0.0",
      description: "API Information for the Colloseum App",
    },
    components: {
      schemas: require("./swaggerDocs/schemaDocs"),
    },
  },
  apis: [path.resolve(__dirname, './swaggerDocs/apisDocs/*.js')],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = swaggerDocs;
