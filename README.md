## Task 1 - Identify and fix the issue with getCatsInfo API

In the getCatsWorker.js file, I encountered an issue where the getCatsInfo API stopped responding after a few requests. The root cause was identified as an undefined data.value.key in the refreshToken function, which led to key errors. To diagnose this, I added logging statements that revealed data.value.key was undefined, highlighting that data.key should be used instead. I updated the code to access data.key directly, ensuring that a default key is used if data.key is missing. This fix resolved the issue, allowing the API to respond correctly to all requests and changed the logger in index.js to debug mode.

### Files Changed

- `getCatsWorker.js` `index.js`
- `.Prettierrc` for formatting
- `index.js` for logging

## Task 2 - Add `correlationId` Header to All Requests and Responses

I added a Correlation ID Header to the application. This involved implementing middleware to add an x-correlation-id header to all incoming requests and outgoing responses. For incoming requests, if the request does not provide an x-correlation-id header, a new UUID is generated and added. For outgoing responses, the x-correlation-id header from the request is included in the response headers.

The changes were made in the src/plugins/correlationId.js file, where I added middleware for handling correlationId, and in the src/index.js file, where I registered the new correlationId plugin.

To address the requirement of tracking requests with a correlationId header, I created a Fastify plugin named CorrelationId to manage correlation IDs throughout the application. The plugin uses AsyncLocalStorage to maintain the correlation ID across the request lifecycle. If the incoming request contains a correlationId header, the plugin uses the existing ID. If not, it generates a new UUID. The correlation ID is added to the response headers to ensure consistency.

### Files Changed

- `src/plugins/correlationId.js`: Added middleware for handling `correlationId`.
- `package.json` installed fastify-plugin, uuid
- `src/index.js`: Registered the new `correlationId` plugin.
- `index.js`

  - Configured the Fastify server to use the `CorrelationId` plugin.
  - Added a validation hook to check for the presence of the `correlationId` header in incoming requests.

- `correlationid.js`
- Implemented the `CorrelationId` plugin to handle the generation, assignment, and propagation of correlation IDs.
- Added a constant `area` to categorize and identify plugin-related log messages.

For logging, I defined a constant area with the value 'fastify-kit-correlationid' to categorize and identify log messages related to this plugin.

I made changes to the index.js file by configuring the Fastify server to use the CorrelationId plugin and adding a validation hook to check for the presence of the correlationId header in incoming requests.

## Task 3 - Terminate the idle worker and recreate when needed


I’ve developed a system that effectively manages worker threads by creating a new thread for each incoming request and terminating them after 15 minutes of inactivity. I’ve ensured that all thread creation and termination events are logged for tracking. Workers are managed in a Map where I keep track of their last active time, and a cleanup process runs every 15 minutes to remove idle workers. 


- A new worker thread is created for every incoming request.
- Worker threads are terminated if they have been idle for 15 minutes.
- Worker thread creation and termination events are logged in the console.

Implementation details:
- Each request triggers the creation of a new worker thread.
- Workers are tracked in a Map, along with their last active time.
- A cleanup interval runs every 15 minutes to check for and terminate idle workers.
- Workers update their last active time after processing each request.

### Files Changed

1. `index.js` (main server file)
2. `utils/generateNewWorker` 
3. `README.md` (this file)

### Files Changed

- `generateNewWorker.js`
