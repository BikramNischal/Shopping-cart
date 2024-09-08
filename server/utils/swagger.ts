import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.1.0",
    info: {
      title: "Shopping Cart API",
      version: "0.1.0",
      description:
        "This is a simple CRUD API application made with Express and documented with Swagger"
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
  },
  apis: ["./routes/*.ts"],
};

export const specs = swaggerJsdoc(options);