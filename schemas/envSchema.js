const envSchema = {
    type: 'object',
    required: ['MONGODB_URI','PORT', "SECRET_KEY_JWT", "SECRET_COOKIES", "NODE_ENV", "REDIS"], // Variables obligatorias
    properties: {
      MONGODB_URI: { type: "string" },
      REDIS: { type: "string" },
      PORT: { type: "number", default: 3000 },
      SECRET_KEY_JWT: { type: "string" },
      SECRET_COOKIES: { type: "string" },
      NODE_ENV: { type: "string" },
    },
  };

  export default envSchema;
  
  


