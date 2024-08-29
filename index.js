const workerManager = require('./utils/generateNewWorker');
const requestTracker = require("./utils/requestTracker");
const { CorrelationId } = require("./utils/correlation_id/correlationid");
const fp = require('fastify-plugin');


const fastify = require("fastify")({
  logger: {
    level: 'debug', 
  },
  connectionTimeout: 5000,
});

fastify.register(fp(CorrelationId), {
  header: "correlationId",
});

fastify.get("/getCatsInfo", function handler(request, reply) {
  requestTracker[request.id] = (result) => reply.send(result);
  workerManager.handleRequest("getCatsWorker", { requestId: request.id });
});

fastify.get("/getDogsInfo", function handler(request, reply) {
  requestTracker[request.id] = (result) => reply.send(result);
  workerManager.handleRequest("getDogsWorker", { requestId: request.id });
});

fastify.listen({ port: 3000 }, (err) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
