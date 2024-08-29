const { parentPort } = require('worker_threads');
const mockFetch = require('../utils/mockFetch');

const cachedTokensMap = new Map();



const refreshToken = async (data) => {
  try {
    const refreshedToken = await invokeTokenService(data.key);
    cachedTokensMap.set(data.key, { token:refreshedToken });
  } catch (error) {
    console.log('in catch refresh token data.value.', data.value)
    throw error;
  }
}

const invokeTokenService = async (key) => {
  return `${key}-${Date.now()}`;
}


const generateToken = async (data) => {
  if (!cachedTokensMap.has(data.key)) {
    const token = await invokeTokenService(data.key);
    cachedTokensMap.set(data.key, { token });
    setTimeout(() => refreshToken(data), 5000);
    return token;
  } else {
    return cachedTokensMap.get(data.key).token;
  }
}


const handleMessage = async (data) => {
  
  const token = await generateToken({
    key: data.key || 'default-token-key', 
  });
  const response = await mockFetch('cats', token);
  return response;
};



parentPort.on('message', async (message) => {
  try {
    const response = await handleMessage(message);
    parentPort.postMessage({ response, requestId: message.requestId });
  } catch (error) {
    console.error('handle Response error:', error);
    parentPort.postMessage({ response: `Error: ${error.message}`, requestId: message.requestId });
  }
});