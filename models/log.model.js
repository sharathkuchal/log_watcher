import Ajv from "ajv";

const ajv = new Ajv();
const logSchema = {
  type: "object",
  properties: {
    type: { type: "string" },
    level: { type: "integer" },
    message: { type: "string" },
    contact: {
      type: "object",
      properties: {
        phone: { type: "array" },
        email: { type: "array" }
      }
    },
    data: {
      type: "object"
    }
  },
  required: ["type", "message"],
  additionalProperties: true
};

const validate = ajv.compile(logSchema);
export default validate;