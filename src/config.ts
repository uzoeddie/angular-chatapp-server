import dotenv from 'dotenv';
import cloudinary from 'cloudinary';
import bunyan from 'bunyan';

dotenv.config({});
class Config {
  public LOG_LEVEL: bunyan.LogLevel | undefined;
  public DATABASE_URL: string | undefined;
  public JWT_TOKEN: string | undefined;
  public CLOUD_NAME: string | undefined;
  public CLOUD_API_KEY: string | undefined;
  public CLOUD_API_SECRET: string | undefined;
  public NEW_RELIC_KEY: string | undefined;
  public SENDER_EMAIL: string | undefined;
  public SENDER_EMAIL_PASSWORD: string | undefined;
  public CLIENT_URL: string | undefined;
  public REDIS_HOST: string | undefined;
  public NODE_ENV: string | undefined;
  public SECRET_KEY_ONE: string | undefined;
  public SECRET_KEY_TWO: string | undefined;
  public SENDGRID_API_KEY: string | undefined;

  constructor() {
    this.LOG_LEVEL = (process.env.LOG_LEVEL || 'info') as bunyan.LogLevel;
    this.DATABASE_URL = process.env.DATABASE_URL || undefined;
    this.JWT_TOKEN = process.env.JWT_TOKEN || undefined;
    this.CLOUD_NAME = process.env.CLOUD_NAME || undefined;
    this.CLOUD_API_KEY = process.env.CLOUD_API_KEY || undefined;
    this.CLOUD_API_SECRET = process.env.CLOUD_API_SECRET || undefined;
    this.NEW_RELIC_KEY = process.env.NEW_RELIC_KEY || undefined;
    this.SENDER_EMAIL = process.env.SENDER_EMAIL || undefined;
    this.SENDER_EMAIL_PASSWORD = process.env.SENDER_EMAIL_PASSWORD || undefined;
    this.CLIENT_URL = process.env.CLIENT_URL || undefined;
    this.REDIS_HOST = process.env.REDIS_HOST || undefined;
    this.NODE_ENV = process.env.NODE_ENV || undefined;
    this.SECRET_KEY_ONE = process.env.SECRET_KEY_ONE || undefined;
    this.SECRET_KEY_TWO = process.env.SECRET_KEY_TWO || undefined;
    this.SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || undefined;
  }

  public createLogger(name: string): bunyan {
    return bunyan.createLogger({ name, level: this.LOG_LEVEL });
  }

  public validateConfig(): void {
    for (const [key, value] of Object.entries(this)) {
      if (value === undefined) {
        throw new Error(`Configuration ${key} is undefined`);
      }
    }
  }

  public cloudinaryConfig(): void {
    cloudinary.v2.config({
      cloud_name: this.CLOUD_NAME,
      api_key: this.CLOUD_API_KEY,
      api_secret: this.CLOUD_API_SECRET
    });
  }
}

export const config: Config = new Config();
