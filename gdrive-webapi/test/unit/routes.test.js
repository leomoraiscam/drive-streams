import { describe, test, jest } from '@jest/globals';
import Routes from '../../src/routes';

describe('Routes', () => {

  describe('setSocketInstance', () => {
    test('setSocket should store io instance', () => {
      const routes = new Routes();

      const ioObject = {
        to: (id) => ioObject,
        emit: (event, message) => {}
      };

      routes.setSocketInstance(ioObject);

      expect(routes.io).toStrictEqual(ioObject);
    });
  });

  describe('handler', () => {
    const defaultParams = {
      request: {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        method: '',
        body: {}
      },
      response: {
        setHeader: jest.fn(),
        writeHead: jest.fn(),
        end: jest.fn()
      },
      values: () => Object.values(defaultParams)
    };

    test('given an inexistent route in should chose default route', async () => {
      const routes = new Routes();

      const params = {
        ...defaultParams
      };

      params.request.method = 'inexistent';

      await routes.handler(...params.values());

      expect(params.response.end).toHaveBeenCalledWith('Hello Word');
    });

    test('it should set any request with CORS enabled', async () => {
      const routes = new Routes();

      const params = {
        ...defaultParams
      };

      params.request.method = 'inexistent';

      await routes.handler(...params.values());

      expect(params.response.setHeader)
        .toHaveBeenCalledWith('Access-Control-Allow-Origin', '*');
    });

    test('given method OPTIONS it should choose method route', async () => {
      const routes = new Routes();

      const params = {
        ...defaultParams
      };

      params.request.method = 'OPTIONS';

      await routes.handler(...params.values());

      expect(params.response.writeHead).toHaveBeenCalledWith(204);
      expect(params.response.end).toHaveBeenCalled();
    });


    test('given method POST it should choose method route', async () => {
      const routes = new Routes();

      const params = {
        ...defaultParams
      };

      params.request.method = 'POST';

      jest.spyOn(routes, routes.post.name).mockResolvedValue();

      await routes.handler(...params.values());

      expect(routes.post).toHaveBeenCalled();
    });


    test('given method GET it should choose method route', async () => {
      const routes = new Routes();

      const params = {
        ...defaultParams
      };

      params.request.method = 'GET';

      jest.spyOn(routes, routes.get.name).mockResolvedValue();

      await routes.handler(...params.values());

      expect(routes.get).toHaveBeenCalled();
    });
  });
});