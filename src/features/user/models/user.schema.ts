import mongoose from 'mongoose';
import { compare, hash } from 'bcryptjs';
import autopopulate from 'mongoose-autopopulate';
import { IUserDocument } from '@user/interface/user.interface';

const userSchema: mongoose.Schema = new mongoose.Schema(
  {
    username: { type: String, index: true },
    uId: { type: Number },
    email: { type: String },
    password: { type: String },
    avatarColor: { type: String },
    passwordResetToken: { type: String, default: '' },
    passwordResetExpires: { type: Number },
    postCount: { type: Number, default: 0 },
    work: [
      {
        company: { type: String, default: '' },
        position: { type: String, default: '' },
        city: { type: String, default: '' },
        description: { type: String, default: '' },
        from: { type: String, default: '' },
        to: { type: String, default: 'Present' }
      }
    ],
    school: [
      {
        name: { type: String, default: '' },
        course: { type: String, default: '' },
        degree: { type: String, default: '' },
        from: { type: String, default: '' },
        to: { type: String, default: 'Present' }
      }
    ],
    placesLived: [
      {
        city: { type: String, default: '' },
        country: { type: String, default: '' },
        year: { type: String, default: '' },
        month: { type: String, default: '' }
      }
    ],
    gender: { type: String, default: '' },
    quotes: { type: String, default: '' },
    about: { type: String, default: '' },
    birthDay: {
      month: { type: String, default: '' },
      day: { type: String, default: '' }
    },
    relationship: { type: String, default: '' },
    blocked: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    blockedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    followersCount: { type: Number, default: 0 },
    followingCount: { type: Number, default: 0 },
    bgImageVersion: { type: String, default: '' },
    bgImageId: { type: String, default: '' },
    profilePicture: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now, index: true },
    notifications: {
      messages: { type: Boolean, default: true },
      reactions: { type: Boolean, default: true },
      comments: { type: Boolean, default: true },
      follows: { type: Boolean, default: true }
    }
  },
  {
    toJSON: {
      transform(_doc, ret) {
        delete ret.password;
        return ret;
      }
    }
  }
);

userSchema.plugin(autopopulate);

userSchema.pre('save', async function (this: IUserDocument, next) {
  const hashedPassword: string = await hash(this.password, 10);
  this.password = hashedPassword;
  next();
});

userSchema.methods.hashPassword = async function (password: string): Promise<string> {
  const hashedPassword: string = await hash(password, 10);
  return hashedPassword;
};

userSchema.methods.comparePassword = function (password: string): Promise<boolean> {
  const hashedPassword: string = (this as IUserDocument).password;
  return compare(password, hashedPassword);
};

const UserModel: mongoose.Model<IUserDocument> = mongoose.model<IUserDocument>('User', userSchema, 'User');

export { UserModel };
