const swaggerJsDoc = require("swagger-jsdoc");
const path = require("path");

const swaggerOptions = {
  definition: {
    openapi: "3.1.0",
    info: {
      title: "Colloseum API's",
      version: "1.0.0",
      description: "API Information for the Tournament App",
    },
    components: {
      schemas: require("./swaggerDocs/schemaDocs"),
    },
  },
  apis: [path.resolve(__dirname, './swaggerDocs/apisDocs/*.js')],
};

// SwaggerDocs generation
const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = swaggerDocs;
