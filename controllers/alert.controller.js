import axios from "axios";
import logger from "../utils/logger.js";

async function send(data) {
  logger.info("sending alert", JSON.stringify(data));
}

export default { send };