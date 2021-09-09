import { describe, test, jest } from '@jest/globals';
import Routes from '../../src/routes';

describe('Routes', () => {
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

  describe('GET', () => {
    test('given method GET it should list all files downloaded', async () => {
      const routes = new Routes();

      const params = {
        ...defaultParams
      };

      const filesStatusesMock = [
        {
          size: "188 kB",
          lastModified: '2021-09-03T20:56:28.443Z',
          owner: 'leonardomorais',
          file: 'file.txt'
        }
      ];

      jest.spyOn(routes.fileHelper, routes.fileHelper.getFilesStatus.name)
        .mockResolvedValue(filesStatusesMock);

      params.request.method = 'GET';

      await routes.handler(...params.values());

      expect(params.response.writeHead).toHaveBeenCalledWith(200);
      expect(params.response.end).toHaveBeenCalledWith(JSON.stringify(filesStatusesMock));
    });
  });
});