/* eslint-disable jest/valid-expect */
/* eslint-disable jest/prefer-expect-assertions */
/* eslint-disable jest/no-hooks */
import sinon from 'sinon';
import redisClient from '../utils/redis';

describe('redisClient', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should set and get a value from Redis', async () => {
    const key = 'test_key';
    const value = 'test_value';

    await redisClient.set(key, value);
    const retrievedValue = await redisClient.get(key);

    expect(retrievedValue).to.equal(value);
  });
});
