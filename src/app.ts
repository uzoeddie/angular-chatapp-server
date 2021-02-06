// require('newrelic');
import express from 'express';
import Logger from 'bunyan';
import { config } from '@root/config';
import databaseConnection from '@root/setupDatabase';
import { ChatServer } from '@root/setupServer';
import cluster from 'cluster';
import { cpus } from 'os';

const log: Logger = config.createLogger('app');
const numCPUs = cpus().length;
class Application {
  public initialize(): void {
    this.loadConfig();
    databaseConnection();
    const app: express.Application = express();
    const server: ChatServer = new ChatServer(app);
    server.start();
    // if (isMaster) {
    //   this.masterProcess();
    // } else {
    //   server.start();
    // }
    Application.handleExit();
  }

  private loadConfig(): void {
    config.validateConfig();
    config.cloudinaryConfig();
  }

  // to be removed
  masterProcess() {
    console.log(`Master ${process.pid} is running`);

    for (let i = 0; i < numCPUs; i++) {
      console.log(`Forking process number ${i}...`);
      cluster.fork();
    }
  }

  private static handleExit(): void {
    process.on('uncaughtException', (err: Error) => {
      log.error('There was an uncaught error', err);
      Application.shutdownProperly(1);
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    process.on('unhandledRejection', (reason: Error | any) => {
      log.error('Unhandled Rejection at promise', reason);
      Application.shutdownProperly(2);
    });

    process.on('SIGINT', () => {
      log.info('Caught SIGINT');
      Application.shutdownProperly(2);
    });

    process.on('SIGTERM', () => {
      log.info('Caught SIGTERM');
      Application.shutdownProperly(2);
    });

    process.on('exit', () => {
      log.info('Exiting');
    });
  }

  private static shutdownProperly(exitCode: number): void {
    Promise.resolve()
      .then(() => {
        log.info('Shutdown complete');
        process.exit(exitCode);
      })
      .catch((err) => {
        log.error('Error during shutdown', err);
        process.exit(1);
      });
  }
}

const application: Application = new Application();
application.initialize();

// To fix the tsconfig-paths error when building the project
// Install @zerollup/ts-transform-paths (as a dependency) and ttypescript (as a dev dependency)
// Add
// "plugins": [
//     {
//       "transform": "@zerollup/ts-transform-paths",
//       "exclude": ["*"]
//     }
//   ],
// to tsconfig.json
// change build command in package.json to
// "build": "ttsc -p ."

// To install terraform on macOS
// download the zip file
// unzip the file (manually or using the unzip command)
// run chmod +x terraform
// sudo mv terraform /usr/local/bin/
// confirm version with terraform --version
