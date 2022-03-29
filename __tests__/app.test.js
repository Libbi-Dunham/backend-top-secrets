const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const request = require('supertest');
const app = require('../lib/app');

describe('backend-top-secrets routes', () => {
  beforeEach(() => {
    return setup(pool);
  });

  afterAll(() => {
    pool.end();
  });

  it('signs up a user w/ post', async () => {
    const res = await request(app)
      .post('/api/v1/user/signup')
      .send({ email: 'miklo@test.com', password: 'ilovetreats' });

    expect(res.body).toEqual({
      id: expect.any(String),
      email: 'miklo@test.com',
    });
  });
});
