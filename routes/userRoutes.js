function usersRoutes(fastify, opts, done) {
  fastify.route({
    method: "GET",
    url: "/profile",
    handler: async(request, reply) => {
      reply.send({ msg: "Hello World" });
    },
  });
  done();
}

export default usersRoutes;
