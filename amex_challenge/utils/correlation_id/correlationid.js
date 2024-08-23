const { AsyncLocalStorage } = require('async_hooks');
const FastifyPlugin = require('fastify-plugin');
const { v4: uuid } = require('uuid');

const storage = new AsyncLocalStorage();

const area = require('./area'); 

const CorrelationId = FastifyPlugin((fastify, options, done) => {
    const log = fastify.log.child({ area });

    
    fastify.decorateRequest('correlationId', null);

    const headerName = options.header || 'X-Correlation-ID';
    const headerNameNormalized = headerName.trim().toLowerCase();

    fastify.addHook('onRequest', (req, reply, done) => {
        const value = req.headers[headerNameNormalized];
  
        let correlationId = typeof value === 'string' ? value : Array.isArray(value) && value.length > 0 ? value[0] : undefined;

        if (correlationId) {
            log.debug('Correlation ID resolved from HTTP request: %s', correlationId);
        } else {
            correlationId = uuid();
            log.debug('Correlation ID is generated: %s', correlationId);
            console.log(correlationId, 'JW')
        }

        if (options.skipResponseHeader !== true) {
            reply.header(headerName, correlationId);
        }
        req.correlationId = correlationId;

        storage.run(correlationId, done);
    });
    done();
}, {
    name: 'CorrelationId',
});

const getCorrelationId = () => storage.getStore();

module.exports = {
    CorrelationId,
    getCorrelationId
};
