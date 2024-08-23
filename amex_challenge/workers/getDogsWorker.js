const { parentPort } = require('worker_threads');
const mockFetch = require('../utils/mockFetch');


const handleResponse = async (message) => {
  console.log('handling request to get dogs');
  const requestId = message.requestId;
  const response = await mockFetch('dogs');
  parentPort.postMessage({ response, requestId });
}


parentPort.on('message', async (message) => {
  await handleResponse(message);
});