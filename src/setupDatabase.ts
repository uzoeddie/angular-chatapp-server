import { config } from '@root/config';
import Logger from 'bunyan';
import mongoose, { ConnectionOptions } from 'mongoose';

const log: Logger = config.createLogger('database');

export default () => {
  // replica set connection locally
  // run command top to find the pid of mongod
  // run kill <pid>
  // mongod --config /usr/local/etc/mongod.conf --fork --replSet rs0

  const connectionOptions: ConnectionOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
  };
  const connect = () => {
    mongoose
      .connect(`${config.DATABASE_URL}`, connectionOptions)
      .then(() => {
        return log.info('Successfully connected to database');
      })
      .catch((error) => {
        log.error('Error connecting to database: ', error);
        return process.exit(1);
      });
  };
  connect();

  mongoose.connection.on('disconnected', connect);
};

// "husky": {
//   "hooks": {
//     "pre-commit": "npm run lint"
//   }
// },
