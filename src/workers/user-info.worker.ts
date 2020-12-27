import { DoneCallback, Job } from 'bull';
import _ from 'lodash';
import { IUserSchool, IUserWork, IUserPlacesLived } from '@user/interface/user.interface';
import { updateUserPropListInfoInRedisCache, updateSingleUserItemInRedisCache } from '@redis/user-info-cache';

class UserInfoWorker {
  async updateUserPropListInCache(jobQueue: Job, done: DoneCallback): Promise<void> {
    try {
      const { key, prop, type, data, paramId } = jobQueue.data;
      let { value } = jobQueue.data;
      if (value === null) {
        const removedItem = _.find(data, (item: IUserSchool | IUserWork | IUserPlacesLived) => {
          return `${item._id}` === paramId;
        });
        value = removedItem;
      }
      await updateUserPropListInfoInRedisCache(key, prop, value, type);
      jobQueue.progress(100);
      done(null, jobQueue.data);
    } catch (error) {
      done(error);
    }
  }

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
}

export const userInfoWorker: UserInfoWorker = new UserInfoWorker();
