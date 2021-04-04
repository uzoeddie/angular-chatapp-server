import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import crypto from 'crypto';
import publicIP from 'public-ip';
import moment from 'moment';

import { config } from '@root/config';
import { BadRequestError } from '@global/error-handler';
import { IUserDocument } from '@user/interface/user.interface';
import { UserModel } from '@user/models/user.schema';
import { forgotPasswordTemplate } from '@email/templates/forgot/forgot-template';
import { resetPasswordTemplate } from '@email/templates/reset/reset-template';
import { joiValidation } from '@global/decorators/joi-validation.decorator';
import { passwordSchema, passwordUpdateSchema } from '@user/schemes/auth/password';
import { emailQueue } from '@queues/email.queue';

export class Password {
  @joiValidation(passwordSchema)
  public async create(req: Request, res: Response): Promise<void> {
    const existingAuthUser: IUserDocument | null = await UserModel.findOne({ email: req.body.email });
    if (!existingAuthUser) {
      throw new BadRequestError('Invalid credential');
    }
    const randomBytes: Buffer = await crypto.randomBytes(20);
    const randomCharacters: string = randomBytes.toString('hex');
    existingAuthUser.passwordResetToken = randomCharacters;
    existingAuthUser.passwordResetExpires = Date.now() + 60 * 60 * 1000;
    await existingAuthUser.save();

    const resetLink = `${config.CLIENT_URL}/auth/reset-password?token=${randomCharacters}`;
    const template: string = forgotPasswordTemplate.passwordResetTemplate(existingAuthUser.username, resetLink);
    emailQueue.addEmailJob('forgotPasswordMail', { receiverEmail: req.body.email, template, type: 'Reset your password' });
    res.status(HTTP_STATUS.OK).json({ message: 'Password reset email sent.', user: {}, token: '', notification: false });
  }

  @joiValidation(passwordUpdateSchema)
  public async update(req: Request, res: Response): Promise<void> {
    const existingAuthUser: IUserDocument | null = await UserModel.findOne({
      passwordResetToken: req.params.token,
      passwordResetExpires: { $gt: Date.now() }
    });
    if (!existingAuthUser) {
      throw new BadRequestError('Reset token has expired.');
    }
    existingAuthUser.password = req.body.password;
    existingAuthUser.passwordResetToken = undefined;
    existingAuthUser.passwordResetExpires = undefined;
    await existingAuthUser.save();

    const templateParams = {
      username: existingAuthUser.username,
      email: existingAuthUser.email,
      ipaddress: publicIP.v4(),
      date: moment(new Date()).format('DD/MM/YYYY HH:mm')
    };
    const template: string = resetPasswordTemplate.passwordResetConfirmationTemplate(templateParams);
    emailQueue.addEmailJob('resetPasswordConfirmation', {
      receiverEmail: existingAuthUser.email,
      template,
      type: 'Password Reset Confirmation'
    });
    res.status(HTTP_STATUS.OK).json({ message: 'Password successfully updated.', user: {}, token: '', notification: false });
  }
}
