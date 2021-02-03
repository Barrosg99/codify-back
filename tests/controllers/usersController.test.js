require('dotenv').config();

const AuthError = require('../../src/errors/AuthError');

const usersController = require('../../src/controllers/usersController');

describe('Testing postAdminSignIn of usersController', () => {
  it('postAdminSignIn - Should return a throw error trying to login with wrong username and password.', async () => {
    process.env.ADMIN_USERNAME = 'admin';
    process.env.ADMIN_PASSWORD = 'admin';

    async function login() {
      return await usersController.postAdminSignIn('Paola', '12345');
    }

    expect(login).rejects.toThrow(AuthError);
  });

  it('postAdminSignIn - Should return a token if username and password are correct.', async () => {
    process.env.ADMIN_USERNAME = 'admin';
    process.env.ADMIN_PASSWORD = 'admin';

    const login = await usersController.postAdminSignIn('admin', 'admin');
    console.log(login);

    expect(login).toEqual(expect.any(String));
    expect(login.length).toBeGreaterThanOrEqual(121);
  });
});
