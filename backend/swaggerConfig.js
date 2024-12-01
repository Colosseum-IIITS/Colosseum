const swaggerJsDoc = require("swagger-jsdoc");

const swaggerOptions = {
  definition: {
    openapi: "3.1.0", // Updated version
    info: {
      title: "API Documentation",
      version: "1.0.0",
      description: "API Information",
    },
    components: {
      schemas: require("../docs/swaggerDocs"), // Make sure this path is correct
    },
  },
  apis: ["./routes/*.js"], // Make sure this path matches your project structure
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = swaggerDocs;
