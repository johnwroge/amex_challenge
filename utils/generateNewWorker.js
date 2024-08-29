const { Worker } = require('worker_threads');
const path = require('path');
const requestTracker = require('./requestTracker');

const workers = new Map();
const WORKER_IDLE_TIMEOUT = .25 * 60 * 1000; 

const generateNewWorker = (workerName) => {
  const worker = new Worker(path.join(__dirname, '../workers', `${workerName}.js`));
  const workerInfo = { worker, lastActiveTime: Date.now() };
  workers.set(worker, workerInfo);

  worker.on('message', (data) => {
    const { response, requestId } = data;
    if (requestTracker[requestId]) {
      requestTracker[requestId](response);
      delete requestTracker[requestId];
    }
    workerInfo.lastActiveTime = Date.now();
  });

  worker.on('error', (error) => {
    console.error(`Worker encountered an error:`, error);
    worker.terminate();
  });

  worker.on('exit', () => {
    workers.delete(worker);
    console.log(`Worker terminated`);
  });

  console.log(`Worker created at ${new Date().toLocaleString()}`);

  return worker;
};

const terminateIdleWorkers = () => {
  const now = Date.now();
  workers.forEach((workerInfo, worker) => {
    if (now - workerInfo.lastActiveTime > WORKER_IDLE_TIMEOUT) {
      console.log(`Terminating idle worker at ${new Date().toLocaleString()}`);
      worker.terminate();
    }
  });
};

const handleRequest = (workerName, requestData) => {
  const worker = generateNewWorker(workerName);
  worker.postMessage(requestData);
};

const startWorkerCleanup = () => {
  setInterval(() => {
    terminateIdleWorkers();
  }, 1000);
};

startWorkerCleanup();

module.exports = {
  handleRequest
};
