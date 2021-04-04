import mongoose from 'mongoose';
import { IChatMessage } from '@chat/interface/chat.interface';
import { MessageModel } from '@chat/models/chat.schema';
import { ICommentDocument, IFormattedReactions, IReactionDocument, IReactions } from '@comments/interface/comment.interface';
import { CommentsModel } from '@comments/models/comment.schema';
import { Helpers } from '@global/helpers';
import { flattenedChatList } from '@mock/chat.mock';
import { commentsData, reactionData } from '@mock/comment.mock';
import { postMockData } from '@mock/post.mock';
import { IPostDocument } from '@posts/interface/post.interface';
import { PostModel } from '@posts/models/post.schema';

describe('Helpers', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should convert first letter of string to uppercase (firstLetterUppercase)', () => {
    const convertedString: string = Helpers.firstLetterUppercase('testing');
    expect(convertedString).toEqual('Testing');
  });

  it('should convert all strings to lowercase (lowerCase)', () => {
    const convertedString: string = Helpers.lowerCase('TESTING');
    expect(convertedString).toEqual('testing');
  });

  it('should select a random color and return a string (avatarColor)', () => {
    const randomColorString: string = Helpers.avatarColor();
    expect(typeof randomColorString).toEqual('string');
  });

  it('should format reactions (formattedReactions)', () => {
    const reactions: IReactions = {
      like: 5,
      love: 1,
      haha: 1,
      wow: 3,
      sad: 1,
      angry: 2
    };
    const formattedReactions: IFormattedReactions[] = Helpers.formattedReactions(reactions);
    expect(formattedReactions).toEqual([
      { type: 'like', value: 5 },
      { type: 'love', value: 1 },
      { type: 'haha', value: 1 },
      { type: 'wow', value: 3 },
      { type: 'sad', value: 1 },
      { type: 'angry', value: 2 }
    ]);
  });

  it('should parse a stringified property (parseJson)', () => {
    const parsedString: string = Helpers.parseJson(JSON.stringify('This is a test'));
    expect(parsedString).toEqual('This is a test');
  });

  it('should return post data (getUserPosts)', async () => {
    jest.spyOn(PostModel, 'aggregate').mockResolvedValueOnce([postMockData]);
    const postDocument: IPostDocument[] = await Helpers.getUserPosts({}, 1, 2, { createdAt: -1 });
    expect(postDocument).toEqual([postMockData]);
  });

  it('should return post comments (getPostComments)', async () => {
    jest.spyOn(CommentsModel, 'aggregate').mockResolvedValueOnce([commentsData]);
    const commentsDocument: ICommentDocument[] = await Helpers.getPostComments({ _id: '6027f77087c9d9ccb1555268' }, 0, 10, {
      createdAt: -1
    });
    expect(commentsDocument).toEqual([commentsData]);
  });

  it('should return post reactions (getPostReactions)', async () => {
    jest.spyOn(Promise, 'all').mockResolvedValueOnce(Promise.resolve([[reactionData], 1]));
    const reactionDocument: [IReactionDocument[], number] = await Helpers.getPostReactions(
      { postId: mongoose.Types.ObjectId('6027f77087c9d9ccb1555268') },
      0,
      1,
      { createdAt: -1 }
    );
    expect(reactionDocument).toEqual([[reactionData], 1]);
  });

  it('should return messages (getMessages)', async () => {
    jest.spyOn(MessageModel, 'aggregate').mockResolvedValueOnce(flattenedChatList);
    const chatMessage: IChatMessage[] = await Helpers.getMessages({ conversationId: '6027f77087c9d9ccb1555268' }, { createdAt: -1 });
    expect(chatMessage).toEqual(flattenedChatList);
  });

  it('should call escapeRegex', async () => {
    const escapedString: string = Helpers.escapeRegex('testing?');
    expect(escapedString).toEqual('testing\\?');
  });
});
