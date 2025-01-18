const registerUserSchema = {
    body: {
      type: 'object',
      required: ['name','email', 'password'], // Campos obligatorios
      properties: {
        name: { type: 'string' }, // Validación de nombre
        email: { type: 'string', format: 'email' }, // Validación de email
        password: { type: 'string', minLength: 8, format: "password" }, // Validación de contraseña
      },
    },
  };
  const loginUserSchema = {
    body: {
      type: 'object',
      required: ['email', 'password', 'fingerprint'], // Campos obligatorios
      properties: {
        email: { type: 'string', format: 'email' }, // Validación de email
        password: { type: 'string', minLength: 8, format: "password" }, // Validación de contraseña
        fingerprint: { type: 'string' }, // Validación de fingerprint
      },
    },
  }

  
export { registerUserSchema, loginUserSchema };