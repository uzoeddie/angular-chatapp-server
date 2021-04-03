import fs from 'fs';
import ejs from 'ejs';

class NotificationTemplate {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public notificationMessageTemplate(templateParams: any): string {
    const { username, header, message } = templateParams;
    const template: string = ejs.render(fs.readFileSync(__dirname + '/notification.ejs', 'utf8'), {
      username,
      header,
      message
    });
    return template;
  }
}

export const notificationTemplate: NotificationTemplate = new NotificationTemplate();
