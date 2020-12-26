// require('newrelic');
import express from 'express';
import { config } from '@root/config';
import { ChatServer } from '@root/setupServer';
import databaseConnection from '@root/setupDatabase';
import Logger from 'bunyan';

const log: Logger = config.createLogger('app');
class Application {

    constructor() {}

    public init(): void {
        this.loadConfig();
        databaseConnection();
        const app: express.Application = express()
        const server: ChatServer = new ChatServer(app);
        server.start();
        Application.handleExit();
    }

    private loadConfig(): void {
        config.validateConfig();
        config.cloudinaryConfig();
    }

    private static handleExit(): void {
        process.on('uncaughtException', (err: Error) => {
            log.error('There was an uncaught error', err);
            Application.shutdownProperly(1);
        });

        process.on('unhandledRejection', (reason: {} | null | undefined) => {
            log.error('Unhandled Rejection at promise', reason);
            Application.shutdownProperly(2);
        });

        process.on('SIGINT', () => {
            log.info('Caught SIGINT');
            Application.shutdownProperly(128 + 2);
        });

        process.on('SIGTERM', () => {
            log.info('Caught SIGTERM');
            Application.shutdownProperly(128 + 2);
        });

        process.on('exit', () => {
            log.info('Exiting');
        });
    }

    private static shutdownProperly(exitCode: number): void {
        Promise.resolve()
            .then(() => {
                log.info('Shutdown complete')
                process.exit(exitCode)
            })
            .catch(err => {
                log.error('Error during shutdown', err)
                process.exit(1)
            })
    }
}

const application: Application = new Application();
application.init();

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
