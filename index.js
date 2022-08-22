import './env.js';
import LogWatcher from './libs/logWatcher.js';
import logger from './utils/logger.js';
import alert from './controllers/alert.controller.js';

/* initiate logWatcher */
const logWatcher = new LogWatcher();

logWatcher.start();

/* logWatcher events */
logWatcher.on('alert', (data) => {
  logger.info('sending alert', data);
});

logWatcher.on('log', () => {
  logger.info('just a generic log');
});