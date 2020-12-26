import fs from 'fs';
import ejs from 'ejs';

class ResetPasswordTemplate {
    constructor() {}

    public passwordResetConfirmationTemplate(templateParams: any): string {
        const { username, email, ipaddress, date } = templateParams;
        const template: string = ejs.render(
            fs.readFileSync(__dirname + '/reset-confirmation.ejs', 'utf8'),
            {
                username,
                email,
                ipaddress,
                date
            },
        );
        return template;
    }
}

export const resetPasswordTemplate: ResetPasswordTemplate = new ResetPasswordTemplate();