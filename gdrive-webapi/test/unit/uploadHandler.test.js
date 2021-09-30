import { describe, test, jest, beforeEach } from '@jest/globals';
import UploadHandler from '../../src/uploadHandler';
import TestUtil from '../_util/testUtil';
import fs from 'fs';
import { resolve } from 'path';
import { pipeline } from 'stream/promises';
import { logger } from '../../src/logger';

describe('Upload handler', () => {
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

  const ioObject = {
    to: (id) => ioObject,
    emit: (event, message) => {}
  };

  beforeEach(() => {
    jest.spyOn(logger, 'info')
      .mockImplementation()
  })

  describe('registerEvents', () => {
    test('should call onFile and onFinish functions on busboy instance', async () => {
      const uploadHandler = new UploadHandler({
        io: ioObject,
        socketId: '01'
      });

      jest.spyOn(uploadHandler, uploadHandler.onFile.name)
        .mockResolvedValue();

      const headers = {
        'content-type': 'multipart/form-data; boundary='
      };

      const onFinish = jest.fn();

      const busboyInstance = uploadHandler.registerEvents(headers, onFinish);

      const fileStream = await TestUtil.generateReadableStream(['chunk', 'of', 'data']);
     
      busboyInstance.emit('file', 'fieldname', fileStream, 'filename.txt');

      busboyInstance.listeners("finish")[0].call();

      expect(uploadHandler.onFile).toHaveBeenCalled();
      expect(onFinish).toHaveBeenCalled();
    });

    describe('onFile', () => {
      test('given a stream file it should save it on disk', async () => {
        const chunks = ['hey', 'dude']
        const downloadsFolder = '/tmp';
        
        const handler = new UploadHandler({
            io: ioObject,
            socketId: '01',
            downloadsFolder
        })

        const onData = jest.fn();

        jest.spyOn(fs, fs.createWriteStream.name)
          .mockImplementation(() => TestUtil.generateWritableStream(onData))

        const onTransform = jest.fn();

        jest.spyOn(handler, handler.handleFileBytes.name)
          .mockImplementation(() => TestUtil.generateTransformStream(onTransform));

        const params = {
          fieldname: 'video',
          file: TestUtil.generateReadableStream(chunks),
          filename: 'mockFile.mov'
        };

        await handler.onFile(...Object.values(params));

        expect(onData.mock.calls.join()).toEqual(chunks.join());
        expect(onTransform.mock.calls.join()).toEqual(chunks.join());

        const expectedFilename = resolve(handler.downloadsFolder, params.filename)

        expect(fs.createWriteStream).toHaveBeenCalledWith(expectedFilename);
      });
    });

    describe('handleFileBytes', () => {
      test('should call emit function and it is a transform stream', async () => {
        jest.spyOn(ioObject, ioObject.to.name)
        jest.spyOn(ioObject, ioObject.emit.name);

        const handler = new UploadHandler({
          io: ioObject,
          socketId: '01'
        });

        const messages = ['hello'];
        const source = TestUtil.generateReadableStream(messages);
        
        const onWrite = jest.fn();
        const target = TestUtil.generateWritableStream(onWrite);
      
        await pipeline(
          source,
          handler.handleFileBytes("filename.txt"),
          target
        );

        expect(ioObject.to).toHaveBeenCalledTimes(messages.length);
        expect(ioObject.emit).toHaveBeenCalledTimes(messages.length);
        expect(onWrite).toBeCalledTimes(messages.length);
        expect(onWrite.mock.calls.join()).toEqual(messages.join());
      });
    });
  });
});