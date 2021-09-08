import { logger } from './logger.js';

export default class Routes {
  io

  constructor() {}

  setSocketInstance(io) {
    this.io = io;
  }

  async defaultRoute(request, response) {
    response.end('Hello Word');
  }

  async options(request, response) {
    response.writeHead(204);
    response.end();
  }

  async get(request, response) {
    logger.info('get');
    response.end();
  }

  async post(request, response) {
    logger.info('post');
    response.end();
  }  

  handler(request, response) {
    response.setHeader('Access-Control-Allow-Origin', '*');

    const chosen = this[request.method.toLowerCase()] || this.defaultRoute;

    return chosen.apply(this, [request, response]);
  }
}