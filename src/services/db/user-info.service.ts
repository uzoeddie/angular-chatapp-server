/* eslint-disable @typescript-eslint/no-explicit-any */
import { IUserBirthDay, IUserPlacesLived, IUserSchool, IUserWork } from '@user/interface/user.interface';
import { UserModel } from '@user/models/user.schema';
import mongoose from 'mongoose';

class UserInfo {
  public async updateGender(username: string, gender: string): Promise<void> {
    await UserModel.updateOne({ username }, { $set: { gender } });
  }

  public async updateBirthDay(username: string, value: IUserBirthDay): Promise<void> {
    const { month, day } = value;
    await UserModel.updateOne({ username }, { $set: { 'birthDay.month': month, 'birthDay.day': day } });
  }

  public async updateRelationship(username: string, relationship: string): Promise<void> {
    await UserModel.updateOne({ username }, { $set: { relationship } });
  }

  public async addWork(username: string, work: IUserWork): Promise<void> {
    await UserModel.updateOne(
      { username },
      {
        $push: {
          work: {
            _id: work._id,
            company: work.company,
            position: work.position,
            city: work.city,
            description: work.description,
            from: work.from,
            to: work.to
          }
        }
      }
    );
  }

  public async addSchool(username: string, school: IUserSchool): Promise<void> {
    await UserModel.updateOne(
      { username },
      {
        $push: {
          school: {
            _id: school._id,
            name: school.name,
            course: school.course,
            degree: school.degree,
            from: school.from,
            to: school.to
          }
        }
      }
    );
  }

  public async addPlacesLived(username: string, places: IUserPlacesLived): Promise<void> {
    await UserModel.updateOne(
      { username },
      {
        $push: {
          placesLived: {
            _id: places._id,
            city: places.city,
            country: places.country,
            year: places.year,
            month: places.month
          }
        }
      }
    );
  }

  public async updateAbout(username: string, about: string): Promise<void> {
    await UserModel.updateOne({ username }, { $set: { about } });
  }

  public async updateQuotes(username: string, quotes: string): Promise<void> {
    await UserModel.updateOne({ username }, { $set: { quotes } });
  }

  public async editWork(username: string, workId: string, work: IUserWork): Promise<void> {
    await UserModel.updateOne(
      {
        username,
        'work._id': workId
      },
      {
        $set: {
          'work.$.company': work.company,
          'work.$.position': work.position,
          'work.$.city': work.city,
          'work.$.description': work.description,
          'work.$.from': work.from,
          'work.$.to': work.to
        }
      }
    );
  }

  public async editSchool(username: string, schoolId: string, school: IUserSchool): Promise<void> {
    await UserModel.updateOne(
      {
        username,
        'school._id': schoolId
      },
      {
        $set: {
          'school.$.name': school.name,
          'school.$.course': school.course,
          'school.$.degree': school.degree,
          'school.$.from': school.from,
          'school.$.to': school.to
        }
      }
    );
  }

  public async editPlacesLived(username: string, placeId: string, places: IUserPlacesLived): Promise<void> {
    await UserModel.updateOne(
      {
        username,
        'placesLived._id': placeId
      },
      {
        $set: {
          'placesLived.$.city': places.city,
          'placesLived.$.country': places.country,
          'placesLived.$.year': places.year,
          'placesLived.$.month': places.month
        }
      }
    );
  }

  public async deleteWork(username: string, workId: string): Promise<void> {
    await UserModel.updateOne(
      { username },
      {
        $pull: {
          work: {
            _id: mongoose.Types.ObjectId(workId)
          }
        }
      }
    );
  }

  public async deleteSchool(username: string, schoolId: string): Promise<void> {
    await UserModel.updateOne(
      { username },
      {
        $pull: {
          school: {
            _id: mongoose.Types.ObjectId(schoolId)
          }
        }
      }
    );
  }

  public async deletePlace(username: string, placeId: string): Promise<void> {
    await UserModel.updateOne(
      { username },
      {
        $pull: {
          placesLived: {
            _id: mongoose.Types.ObjectId(placeId)
          }
        }
      }
    );
  }
}

export const userInfoService: UserInfo = new UserInfo();
