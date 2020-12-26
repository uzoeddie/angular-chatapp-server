import fs from 'fs';
import ejs from 'ejs';

class ForgotPasswordTemplate {
    constructor() {}

    public passwordResetTemplate(username: string, resetLink: string): string {
        const template: string = ejs.render(
            fs.readFileSync(__dirname + '/forgot.ejs', 'utf8'), { username, resetLink },
        );
        return template;
    }
}

export const forgotPasswordTemplate: ForgotPasswordTemplate = new ForgotPasswordTemplate();