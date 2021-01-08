import { DoneCallback, Job } from 'bull';
import { updateSingleUserItemInRedisCache } from '@redis/user-info-cache';
import { userInfoService } from '@db/user-info.service';

class UserInfoWorker {
  // async updateUserPropListInCache(jobQueue: Job, done: DoneCallback): Promise<void> {
  //   try {
  //     const { key, prop, type, data, paramId } = jobQueue.data;
  //     let { value } = jobQueue.data;
  //     if (value === null) {
  //       const removedItem = _.find(data, (item: IUserSchool | IUserWork | IUserPlacesLived) => {
  //         return `${item._id}` === paramId;
  //       });
  //       value = removedItem;
  //     }
  //     await updateUserPropListInfoInRedisCache(key, prop, value, type);
  //     jobQueue.progress(100);
  //     done(null, jobQueue.data);
  //   } catch (error) {
  //     done(error);
  //   }
  // }

  //.....................New.....................

  async updateSinglePropInCache(jobQueue: Job, done: DoneCallback): Promise<void> {
    try {
      const { key, prop, value } = jobQueue.data;
      await updateSingleUserItemInRedisCache(key, prop, value);
      jobQueue.progress(100);
      done(null, jobQueue.data);
    } catch (error) {
      done(error);
    }
  }

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
      jobQueue.progress(100);
      done(null, jobQueue.data);
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
      jobQueue.progress(100);
      done(null, jobQueue.data);
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
      jobQueue.progress(100);
      done(null, jobQueue.data);
    } catch (error) {
      done(error);
    }
  }

  async updateGender(jobQueue: Job, done: DoneCallback): Promise<void> {
    try {
      const { key, value } = jobQueue.data;
      await userInfoService.updateGender(key, value);
      jobQueue.progress(100);
      done(null, jobQueue.data);
    } catch (error) {
      done(error);
    }
  }

  async updateBirthday(jobQueue: Job, done: DoneCallback): Promise<void> {
    try {
      const { key, value } = jobQueue.data;
      await userInfoService.updateBirthDay(key, value);
      jobQueue.progress(100);
      done(null, jobQueue.data);
    } catch (error) {
      done(error);
    }
  }

  async updateRelationship(jobQueue: Job, done: DoneCallback): Promise<void> {
    try {
      const { key, value } = jobQueue.data;
      await userInfoService.updateRelationship(key, value);
      jobQueue.progress(100);
      done(null, jobQueue.data);
    } catch (error) {
      done(error);
    }
  }

  async updateAbout(jobQueue: Job, done: DoneCallback): Promise<void> {
    try {
      const { key, value } = jobQueue.data;
      await userInfoService.updateAbout(key, value);
      jobQueue.progress(100);
      done(null, jobQueue.data);
    } catch (error) {
      done(error);
    }
  }

  async updateQuotes(jobQueue: Job, done: DoneCallback): Promise<void> {
    try {
      const { key, value } = jobQueue.data;
      await userInfoService.updateQuotes(key, value);
      jobQueue.progress(100);
      done(null, jobQueue.data);
    } catch (error) {
      done(error);
    }
  }
}

export const userInfoWorker: UserInfoWorker = new UserInfoWorker();
