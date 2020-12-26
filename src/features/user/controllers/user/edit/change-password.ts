import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { joiValidation } from '@global/decorators/joi-validation.decorator';
import publicIP from 'public-ip';
import moment from 'moment';
import { UserModel } from '@user/models/user.schema';
import { changePasswordSchema } from '@user/schemes/user/info';
import { BadRequestError } from '@global/error-handler';
import { IUserDocument } from '@user/interface/user.interface';
import { resetPasswordTemplate } from '@email/templates/reset/reset-template';
import { mailTransport } from '@email/mail-transport';
import { config } from '@root/config';

export class ChangePassword {
    @joiValidation(changePasswordSchema)
    public async update(req: Request, res: Response): Promise<void> {
        const { currentPassword, newPassword, confirmPassword } = req.body;
        if (newPassword !== confirmPassword) {
            throw new BadRequestError('Passwords do not match.');
        }
        const existingAuthUser: IUserDocument = await UserModel.findOne({ username: req.currentUser?.username }).exec() as IUserDocument;
        const passwordsMatch: boolean = await existingAuthUser!.comparePassword(currentPassword);
        if (!passwordsMatch) {
            throw new BadRequestError('Invalid credentials');
        }
        const hashedPassword: string = await existingAuthUser!.hashPassword(newPassword)
        await UserModel.updateOne({ _id: req.currentUser?.userId }, { $set: { password: hashedPassword } });
        const templateParams = {
            username: existingAuthUser.username,
            email: existingAuthUser.email,
            ipaddress: publicIP.v4(),
            date: moment(new Date()).format('DD/MM/YYYY HH:mm')
        }
        const template: string = resetPasswordTemplate.passwordResetConfirmationTemplate(templateParams);
        // TODO: Fix issue with username and password for sending emails. Implement sendgrid
        // await mailTransport.sendEmail(config.TESTING_RECEIVER_EMAIL!, 'Password Update Confirmation', template);
        res.status(HTTP_STATUS.OK).json({ message: 'Password updated successfully. You will be redirected shortly to the login page.', notification: true});
    }
}