import Busboy from 'busboy';
import { pipeline } from 'stream/promises'
import { logger } from './logger';
import fs from 'fs';

export default class UploadHandler {
  constructor({ io, socketId, downloadsFolder, messageTimeDelay = 200 }) {
    this.io = io;
    this.socketId = socketId;
    this.downloadsFolder = downloadsFolder;
    this.ON_UPLOAD_EVENT = 'file-upload';
    this.messageTimeDelay = messageTimeDelay;
  }

  canExecute(lastExecution) {
    return ( Date.now() -  lastExecution) > this.messageTimeDelay;
  }

  handleFileBytes(filename) {
    let processAlready = 0;
    this.lastMessageSent = Date.now();

    async function* handleData(source) {
      for await (const chunk of source) {
        yield chunk;

        processAlready += chunk.length;

        if(!this.canExecute(this.lastMessageSent)) {
          continue
        }

        this.io.to(this.socketId).emit(this.ON_UPLOAD_EVENT, {
          processAlready,
          filename
        });

        logger.info(`File [${filename}] got ${processAlready} bytes to ${this.socketId}`);
      }
    }

    return handleData.bind(this);
  }

  async onFile(fieldname, file, filename) {
    const saveTo = `${this.downloadsFolder}/${filename}`

    await pipeline(
      file,
      this.handleFileBytes.apply(this, [filename]),
      fs.createWriteStream(saveTo)
    )

    logger.info(`File [${filename}] finished`)
  }

  registerEvents(headers, onFinish) {
    const busboy = new Busboy({ headers });

    busboy.on('file', this.onFile.bind(this));
    busboy.on('finish', onFinish);

    return busboy;
  }
}