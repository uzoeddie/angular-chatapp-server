import nodemailer from 'nodemailer';
import { BadRequestError } from '@global/error-handler';
import { config } from '@root/config';
import Logger from 'bunyan';
import Mail from 'nodemailer/lib/mailer';
import sendGridMail from '@sendgrid/mail';

const log: Logger = config.createLogger('email');
sendGridMail.setApiKey(config.SENDGRID_API_KEY!);

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
    if (config.NODE_ENV === 'local' || config.NODE_ENV === 'test' || config.NODE_ENV === 'development') {
      this.developmentEmailSender(receiverEmail, subject, body);
    } else {
      this.productionEmailSender(receiverEmail, subject, body);
    }
  }

  private async developmentEmailSender(receiverEmail: string, subject: string, body: string): Promise<void> {
    console.log(receiverEmail);
    console.log(body);
    console.log(body);
    const transporter: Mail = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
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
      console.log(error);
      throw new BadRequestError('Error sending email');
    }
  }

  private async productionEmailSender(receiverEmail: string, subject: string, body: string): Promise<void> {
    const msg = {
      to: receiverEmail, // Change to your recipient
      from: config.SENDER_EMAIL!, // Change to your verified sender
      subject,
      html: body
    };

    try {
      await sendGridMail.send(msg);
    } catch (error) {
      throw new BadRequestError('Error sending email with sendgrid');
    }
  }
}

export const mailTransport: MailTransport = new MailTransport();
