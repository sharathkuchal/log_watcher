import os from 'os';
import fs from 'fs';
import "../env.js";
import { EventEmitter } from 'events';
import logger from './../utils/logger.js';
import validate from '../models/log.model.js';

/* Prerequisites */
const defaultOptions = {
  endOfLineChar: os.EOL,
  logFile: process.env.LOG_FILE_PATH
};


class LogWatcher extends EventEmitter {
  constructor(options) {
    super();
    this.options = options ? Object.assign(defaultOptions, options) : defaultOptions;
  }

  start = () => {
    try {
      
      /* validating logFile */
      if (!this.options.logFile)
      throw new Error("logFile is not set");
      else if (!fs.existsSync(this.options.logFile))
      throw new Error("logFile is missing or inaccessible");
      
      logger.info("logWatcher started...");
      logger.info(`watching logFile -> ${this.options.logFile}`);

      /* Begin watching the log file */
      let fileSize = fs.statSync(this.options.logFile).size;
      fs.watchFile(this.options.logFile, (current, previous) => {
        if (current.mtime <= previous.mtime) return;

        /* only read the portion of the file that is added after start. */
        const newFileSize = fs.statSync(this.options.logFile).size;
        let sizeDelta = newFileSize - fileSize;
        if (sizeDelta < 0) {
          fileSize = 0;
          sizeDelta = newFileSize;
        }
        const buffer = new Buffer.alloc(sizeDelta);
        const fileDescriptor = fs.openSync(this.options.logFile, 'r');
        fs.readSync(fileDescriptor, buffer, 0, sizeDelta, fileSize);
        fs.closeSync(fileDescriptor);
        fileSize = newFileSize;

        this.parseBuffer(buffer);
      });
    } catch (error) {
      logger.error(`${error.message}. Exiting...`);
      return;
    }
  }

  stop = () => {
    fs.unwatchFile(this.options.logFile);
    delete this.stop();
  }

  parseBuffer = (buffer) => {

    // Iterate over each line in the buffer.
    buffer.toString().split(this.options.endOfLineChar).map((line) => {
      if (line === '') return;
      // Check if log is a valid.
      const { isValidLog, log, error } = checkLogLineValidity(line);
      if (isValidLog) {
        // logger.info(`valid log found. ${JSON.stringify(log)}`);
        this.emit(log.type, 1);
      } else {
        logger.info(`invalid log. Reason: ${error}. Skipping...`);
      }
    });
  }
}

function checkLogLineValidity(line) {
  try {
    let log = JSON.parse(line);
    const isValidLog = validate(log);
    return { isValidLog, log, error: validate?.errors && validate.errors[0]?.message ? validate.errors[0].message : "" };
  } catch (error) {
    return { isValidLog: false, log: {}, error: error.message };
  }
}

export default LogWatcher;