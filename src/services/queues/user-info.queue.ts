import Queue from 'bull';
import { userInfoWorker } from '@workers/user-info.worker';
import { BaseQueue } from '@queues/base.queue';
import { IUserJobInfo } from '@user/interface/user.interface';
class UserInfoQueue extends BaseQueue {
  constructor() {
    super('usersInfo');
    this.processUserInfoJob('updateGenderInCache', 5, userInfoWorker.updateGender);
    this.processUserInfoJob('updateBirthdayInCache', 5, userInfoWorker.updateBirthday);
    this.processUserInfoJob('updateRelationshipInCache', 5, userInfoWorker.updateRelationship);
    this.processUserInfoJob('updateUserWorkInCache', 5, userInfoWorker.updateWork);
    this.processUserInfoJob('updateUserSchoolInCache', 5, userInfoWorker.updateSchool);
    this.processUserInfoJob('updateUserPlaceInCache', 5, userInfoWorker.updatePlacesLived);
    this.processUserInfoJob('updateAboutInfoInCache', 5, userInfoWorker.updateAbout);
    this.processUserInfoJob('updateQuotesInCache', 5, userInfoWorker.updateQuotes);
  }

  public addUserInfoJob(name: string, data: IUserJobInfo): void {
    this.addJob(name, data);
  }

  private processUserInfoJob(name: string, concurrency: number, callback: Queue.ProcessCallbackFunction<void>): void {
    this.processJob(name, concurrency, callback);
  }
}

export const userInfoQueue: UserInfoQueue = new UserInfoQueue();
