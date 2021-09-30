import { Readable, Transform, Writable } from 'stream';

export default class TestUtil {
  static generateReadableStream(data) {
    return new Readable({
      objectMode: true,
      read () {
        for (const item of data) {
          this.push(item);
        }

        this.push(null);
      }
    });
  }

  static generateWritableStream(onData) {
    return new Writable({
        objectMode: true,
        write(chunk, encondig, cb) {
            onData(chunk)
            
            cb(null, chunk)
        }
    })
}

  static generateTransformStream(onData) {
    return new Transform({
      objectMode: true,
      transform(chunk, encoding, callback) {
        onData(chunk);

        callback(null, chunk);
      }
    });
  }
}