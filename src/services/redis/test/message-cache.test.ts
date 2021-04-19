import redis, { RedisClient } from 'redis-mock';
import { messageCache } from '@redis/message-cache';
import { redisChatData } from '@mock/chat.mock';

jest.useFakeTimers();

describe('MessageCache', () => {
  let client: RedisClient;
  beforeEach(() => {
    jest.restoreAllMocks();
    client = redis.createClient({ host: '127.0.0.1', port: 6379 });
  });

  afterEach((done) => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    client.flushall(done);
    client.quit(done);
  });

  afterAll((done) => {
    done();
  });

  describe('addChatListToRedisCache', () => {
    it('should add users to chat list', async () => {
      await expect(
        messageCache.addChatListToRedisCache(['6064793b091bf02b6a71067a', '60647959091bf02b6a71067d'], redisChatData)
      ).resolves.toBeUndefined();
    });
  });

  describe('addChatmessageToRedisCache', () => {
    it('should add messages', async () => {
      await expect(messageCache.addChatmessageToRedisCache('6064799e091bf02b6a71067f', redisChatData)).resolves.toBeUndefined();
    });
  });

  describe('updateIsReadPropInRedisCache', () => {
    it('should update message read property', async () => {
      await messageCache.addChatListToRedisCache(['6064793b091bf02b6a71067a', '60647959091bf02b6a71067d'], redisChatData);
      await messageCache.addChatmessageToRedisCache('6064799e091bf02b6a71067f', redisChatData);
      redisChatData.isRead = true;
      await expect(
        messageCache.updateIsReadPropInRedisCache('6064793b091bf02b6a71067a', '60647959091bf02b6a71067d', '6064799e091bf02b6a71067f')
      ).resolves.toEqual(JSON.stringify(redisChatData));
    });
  });

  describe('getChatFromRedisCache', () => {
    it('should get chat list', async () => {
      await messageCache.addChatListToRedisCache(['6064793b091bf02b6a71067a', '60647959091bf02b6a71067d'], redisChatData);
      await expect(messageCache.getChatFromRedisCache('chatList:6064793b091bf02b6a71067a')).resolves.toEqual([
        JSON.stringify(redisChatData)
      ]);
    });

    it('should get messages', async () => {
      await messageCache.addChatmessageToRedisCache('6064799e091bf02b6a71067f', redisChatData);
      await expect(messageCache.getChatFromRedisCache('messages:6064799e091bf02b6a71067f')).resolves.toEqual([
        JSON.stringify(redisChatData)
      ]);
    });
  });

  describe('getSingleChatObjectFromRedisCache', () => {
    it('should get one item from chat list', async () => {
      await messageCache.addChatListToRedisCache(['6064793b091bf02b6a71067a', '60647959091bf02b6a71067d'], redisChatData);
      await expect(messageCache.getSingleChatObjectFromRedisCache('chatList:6064793b091bf02b6a71067a')).resolves.toEqual(
        JSON.stringify(redisChatData)
      );
    });

    it('should get one item from chat message', async () => {
      await messageCache.addChatmessageToRedisCache('6064799e091bf02b6a71067f', redisChatData);
      await expect(messageCache.getSingleChatObjectFromRedisCache('messages:6064799e091bf02b6a71067f')).resolves.toEqual(
        JSON.stringify(redisChatData)
      );
    });
  });
});
