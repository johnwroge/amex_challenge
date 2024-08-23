const {generateNewWorker, updateWorkerActivity } = require("./utils/generateNewWorker");
const requestTracker = require("./utils/requestTracker");
const { CorrelationId } = require("./utils/correlation_id/correlationid");
const fp = require('fastify-plugin');


const getCatsWorker = generateNewWorker("getCatsWorker");
const getDogsWorker = generateNewWorker("getDogsWorker");


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
  getCatsWorker.postMessage({ requestId: request.id });
});

fastify.get("/getDogsInfo", function handler(request, reply) {
  requestTracker[request.id] = (result) => reply.send(result);
  getDogsWorker.postMessage({ requestId: request.id });
});

fastify.listen({ port: 3000 }, (err) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
