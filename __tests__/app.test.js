const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const request = require('supertest');
const app = require('../lib/app');
const UserService = require('../lib/services/UserService');
const res = require('express/lib/response');

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
  it('signs in an existing user', async () => {
    const user = await UserService.create({
      email: 'miklo@test.com',
      password: 'ilovetreats',
    });

    const res = await request(app)
      .post('/api/v1/user/session')
      .send({ email: 'miklo@test.com', password: 'ilovetreats' });

    expect(res.body).toEqual({
      message: 'Successfully signed in',
      user,
    });
  });

  it('protects routes using authenticate', async () => {
    const agent = request.agent(app);
    await UserService.create({
      email: 'miklo@test.com',
      password: 'ilovetreats',
    });

    let res = await agent.get('/api/v1/user/private');
    expect(res.status).toEqual(401);

    await agent
      .post('/api/v1/user/session')
      .send({ email: 'miklo@test.com', password: 'ilovetreats' });
    res = await agent.get('/api/v1/user/private');

    expect(res.body).toEqual({
      message: 'You can only see this if you are logged in',
    });
  });

  it('allows the user to view a list of secrets', async () => {
    const agent = request.agent(app);

    await UserService.create({
      email: 'miklo@test.com',
      password: 'ilovetreats',
    });

    let res = await agent.get('/api/v1/secrets');
    expect(res.status).toEqual(401);

    await agent
      .post('/api/v1/user/session')
      .send({ email: 'miklo@test.com', password: 'ilovetreats' });
    res = await agent.get('/api/v1/secrets');
    expect(res.status).toEqual(200);
  });
});
