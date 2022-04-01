const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const request = require('supertest');
const app = require('../lib/app');
const UserService = require('../lib/services/UserService');

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

  // it('protects routes using authenticate', async () => {
  //   const agent = request.agent(app);
  //   await UserService.create({
  //     email: 'miklo@test.com',
  //     password: 'ilovetreats',
  //   });

  //   let res = await agent.get('/api/v1/user/private');
  //   expect(res.status).toEqual(401);

  //   await agent
  //     .post('/api/v1/user/session')
  //     .send({ email: 'miklo@test.com', password: 'ilovetreats' });
  //   res = await agent.get('/api/v1/user/private');

  //   expect(res.body).toEqual({
  //     message: 'You can only see this if you are logged in',
  //   });
  // });

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
    // make secrets or put in sql file
    res = await agent.get('/api/v1/secrets');
    expect(res.status).toEqual(200);
    // expect all secrets that I have in database^ (78)
  });

  it('should delete a log out user', async () => {
    const agent = request.agent(app);

    await UserService.create({
      email: 'miklo@test.com',
      password: 'ilovetreats',
    });
    await agent
      .post('/api/v1/user/sessions')
      .send({ email: 'miklo@test.com', password: 'ilovetreats' });

    const res = await agent.delete('/api/v1/user/sessions');
    expect(res.body).toEqual({
      success: true,
      message: 'Successfully signed out',
    });
  });

  it('allows a authorized user to create secrets', async () => {
    const agent = request.agent(app);

    await UserService.create({
      email: 'miklo@test.com',
      password: 'ilovetreats',
    });

    await agent
      .post('/api/v1/user/sessions')
      .send({ email: 'miklo@test.com', password: 'ilovetreats' });

    const secrets = {
      title: 'I like chicken over tuna',
      description: 'its better',
      createdAt: expect.any(String),
    };

    const res = await request(app).post('/api/v1/secrets').send(secrets);
    expect(res.body).toEqual({ id: expect.any(String), ...secrets });
  });
});
