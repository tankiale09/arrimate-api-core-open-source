import * as jose from "jose";
import { registerUserSchema, loginUserSchema } from "../schemas/userSchema.js";
import {
  userRegisterHandler,
  userLoginHandler,
  userPrehandler
} from "../services/userService.js";
import {
  jwtService,
  newPrimaryJwtService,
} from "../services/jwtService.js";
function userRoutes(fastify, opts, done) {
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
  done();
}

export default userRoutes;
