import { INotificationSettings, IUserDocument } from '@user/interface/user.interface';
import { UserModel } from '@user/models/user.schema';

class User {
  public async addUserDataToDB(data: IUserDocument): Promise<void> {
    await UserModel.create(data);
  }

  public async updateNotificationSettings(username: string, notifications: INotificationSettings): Promise<void> {
    await UserModel.updateOne({ username }, { $set: { notifications } }, { upsert: true });
  }
}

export const userService: User = new User();
