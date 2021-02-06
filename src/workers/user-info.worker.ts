import { DoneCallback, Job } from 'bull';
import { userInfoService } from '@db/user-info.service';
import { BaseWorker } from '@workers/base.worker';
class UserInfoWorker extends BaseWorker {
  async updateWork(jobQueue: Job, done: DoneCallback): Promise<void> {
    try {
      const { key, value, type, paramsId } = jobQueue.data;
      if (type === 'add') {
        await userInfoService.addWork(key, value);
      } else if (type === 'edit') {
        await userInfoService.editWork(key, paramsId, value);
      } else {
        await userInfoService.deleteWork(key, paramsId);
      }
      this.progress(jobQueue, done);
    } catch (error) {
      done(error);
    }
  }

  async updateSchool(jobQueue: Job, done: DoneCallback): Promise<void> {
    try {
      const { key, value, type, paramsId } = jobQueue.data;
      if (type === 'add') {
        await userInfoService.addSchool(key, value);
      } else if (type === 'edit') {
        await userInfoService.editSchool(key, paramsId, value);
      } else {
        await userInfoService.deleteSchool(key, paramsId);
      }
      this.progress(jobQueue, done);
    } catch (error) {
      done(error);
    }
  }

  async updatePlacesLived(jobQueue: Job, done: DoneCallback): Promise<void> {
    try {
      const { key, value, type, paramsId } = jobQueue.data;
      if (type === 'add') {
        await userInfoService.addPlacesLived(key, value);
      } else if (type === 'edit') {
        await userInfoService.editPlacesLived(key, paramsId, value);
      } else {
        await userInfoService.deletePlace(key, paramsId);
      }
      this.progress(jobQueue, done);
    } catch (error) {
      done(error);
    }
  }

  async updateGender(jobQueue: Job, done: DoneCallback): Promise<void> {
    try {
      const { key, value } = jobQueue.data;
      await userInfoService.updateGender(key, value);
      this.progress(jobQueue, done);
    } catch (error) {
      done(error);
    }
  }

  async updateBirthday(jobQueue: Job, done: DoneCallback): Promise<void> {
    try {
      const { key, value } = jobQueue.data;
      await userInfoService.updateBirthDay(key, value);
      this.progress(jobQueue, done);
    } catch (error) {
      done(error);
    }
  }

  async updateRelationship(jobQueue: Job, done: DoneCallback): Promise<void> {
    try {
      const { key, value } = jobQueue.data;
      await userInfoService.updateRelationship(key, value);
      this.progress(jobQueue, done);
    } catch (error) {
      done(error);
    }
  }

  async updateAbout(jobQueue: Job, done: DoneCallback): Promise<void> {
    try {
      const { key, value } = jobQueue.data;
      await userInfoService.updateAbout(key, value);
      this.progress(jobQueue, done);
    } catch (error) {
      done(error);
    }
  }

  async updateQuotes(jobQueue: Job, done: DoneCallback): Promise<void> {
    try {
      const { key, value } = jobQueue.data;
      await userInfoService.updateQuotes(key, value);
      this.progress(jobQueue, done);
    } catch (error) {
      done(error);
    }
  }
}

export const userInfoWorker: UserInfoWorker = new UserInfoWorker();
