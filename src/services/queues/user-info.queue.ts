import { userInfoWorker } from '@workers/user-info.worker';
import { BaseQueue } from '@queues/base.queue';
import { IUserJobInfo } from '@user/interface/user.interface';
class UserInfoQueue extends BaseQueue {
  constructor() {
    super('usersInfo');
    this.processJob('updateGenderInCache', 5, userInfoWorker.updateGender);
    this.processJob('updateBirthdayInCache', 5, userInfoWorker.updateBirthday);
    this.processJob('updateRelationshipInCache', 5, userInfoWorker.updateRelationship);
    this.processJob('updateUserWorkInCache', 5, userInfoWorker.updateWork);
    this.processJob('updateUserSchoolInCache', 5, userInfoWorker.updateSchool);
    this.processJob('updateUserPlaceInCache', 5, userInfoWorker.updatePlacesLived);
    this.processJob('updateAboutInfoInCache', 5, userInfoWorker.updateAbout);
    this.processJob('updateQuotesInCache', 5, userInfoWorker.updateQuotes);
  }

  public addUserInfoJob(name: string, data: IUserJobInfo): void {
    this.addJob(name, data);
  }
}

export const userInfoQueue: UserInfoQueue = new UserInfoQueue();
