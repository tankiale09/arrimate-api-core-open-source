import * as jose from "jose";
import { registerUserSchema, loginUserSchema } from "../schemas/authSchema.js";
import {
  userRegisterHandler,
  userLoginHandler,
  userPrehandler,
  logoutHandler,
} from "../services/authService.js";
import {
  jwtService,
  newPrimaryJwtService,
} from "../services/jwtService.js";
function authRoutes(fastify, opts, done) {
  // Initialize the SECRET_KEY_JWT with the server, reduce the execution time of the handler.
  const SECRET = jose.base64url.decode(fastify.config.SECRET_KEY_JWT);
  fastify.addHook("onRequest", async (request, reply) => {
    request.SECRET_KEY_JWT = SECRET;
  })
  fastify.route({
    method: "POST",
    url: "/login",
    schema: loginUserSchema,
    preHandler: [userPrehandler, jwtService],
    handler: userLoginHandler,
  });

  fastify.route({
    method: "POST",
    url: "/register",
    schema: registerUserSchema,
    handler: userRegisterHandler,
  });
  fastify.route({
    method: "GET",
    url: "/relogin",
    preHandler: newPrimaryJwtService,
    handler: async function reLoginHandler(request, reply) {
      await reply.send({ newToken: request.jwtPrimary });
    },
  });
  fastify.route({
    method: "GET",
    url: "/logout",
    handler: logoutHandler,
  });
  /*fastify.route({
    method: "GET",
    url: "/test",
    handler: async function (request, reply) {
      const hola = await jose.jwtDecrypt(token, SECRET);
      console.log(hola);
      reply.send({ msg: "Hello World" });
    }
  });*/
  done();
}

export default authRoutes;
