import nodemailer from 'nodemailer';
import { BadRequestError } from '@global/error-handler';
import { config } from '@root/config';
import Logger from 'bunyan';
import Mail from 'nodemailer/lib/mailer';

const log: Logger = config.createLogger('email');

interface IMailOptions {
  from: string;
  to: string;
  subject: string;
  html: string;
}

class MailTransport {
  /**
   * @method sendEmail
   * @param {String} receiverEmail Email of receiver
   * @param {String} subject Email subject
   * @param {String} msgBody Message content of message in html template format
   * @returns {*} void
   */
  public async sendEmail(receiverEmail: string, subject: string, body: string): Promise<void> {
    const transporter: Mail = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: config.SENDER_EMAIL!,
        pass: config.SENDER_EMAIL_PASSWORD!
      }
    });

    // send mail with defined transport object
    const mailOptions: IMailOptions = {
      from: 'Chatty App',
      to: receiverEmail,
      subject,
      html: body
    };
    try {
      await transporter.sendMail(mailOptions);
      log.info('Email sent successfully');
    } catch (error) {
      throw new BadRequestError('Error sending email');
    }
  }
}

export const mailTransport: MailTransport = new MailTransport();
