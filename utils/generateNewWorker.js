const { Worker } = require('worker_threads');
const path = require('path');
const requestTracker = require('./requestTracker');


const workers = new Map();
const WORKER_IDLE_TIMEOUT = 15 * 60 * 1000; 

const generateNewWorker = (workerName) => {
  const worker = new Worker(path.join(__dirname, '../workers', workerName));
  
  workers.set(worker, Date.now());
  
  worker.on('message', (data) => {
    const { response, requestId } = data;
    if (requestTracker[requestId]) {
      requestTracker[requestId](response);
      delete requestTracker[requestId];
    }
  });

  worker.on('error', (error) => {
    console.error('Worker encountered an error:', error);
    worker.terminate();
  });

  worker.on('exit', () => {
    workers.delete(worker);
    console.log('Worker terminated');
  });

  console.log('Worker created');
  return worker;
};

const terminateIdleWorkers = () => {
  const now = Date.now();
  workers.forEach((lastActiveTime, worker) => {
    if (now - lastActiveTime > WORKER_IDLE_TIMEOUT) {
      worker.terminate();
    }
  });
};

const updateWorkerActivity = (worker) => {
  workers.set(worker, Date.now());
};

const startWorkerCleanup = () => {
  setInterval(() => {
    terminateIdleWorkers();
  }, WORKER_IDLE_TIMEOUT);
};

startWorkerCleanup();

module.exports = {
  generateNewWorker,
  updateWorkerActivity
};
