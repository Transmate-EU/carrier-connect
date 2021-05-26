import crypto from 'crypto';

function getHashedToken(loginToken) {
  const hash = crypto.createHash('sha256');
  hash.update(loginToken);
  return hash.digest('base64');
};
async function checkLogin(loginToken) {
  if (!loginToken || typeof loginToken !== "string") {
    throw new Error("token must be set and must be a string!")
  }
  // there is a possible current user connected!
  if (loginToken) {
    // throw an error if the token is not a string
    check(loginToken, String);

    // the hashed token is the key to find the possible current user in the db
    const hashedToken = getHashedToken(loginToken);

    // get the possible current user from the database
    // note: no need of a fiber aware findOne + a fiber aware call break tests
    // runned with practicalmeteor:mocha if eslint is enabled
    const currentUser = await users.findOne(
      {
        'services.resume.loginTokens.hashedToken': hashedToken,
      },
      {
        fields: {
          ...userDefaultFields,
          'services.resume.loginTokens': 1,
        },
      }
    );

    // the current user exists
    if (currentUser) {
      // find the right login token corresponding, the current user may have
      // several sessions logged on different browsers / computers
      const tokenInformation = currentUser.services.resume.loginTokens.find(
        tokenInfo => tokenInfo.hashedToken === hashedToken
      );

      // get an exploitable token expiration date
      const expiresAt = new Date(tokenInformation.when);

      // true if the token is expired
      const isExpired = expiresAt < new Date();

      // if the token is still valid, give access to the current user
      // information in the resolvers context
      if (!isExpired) {
        // return a new context object with the current user & her id
        return {
          user: currentUser,
          userId: currentUser._id,
        };
      }
    }
  }

  return {
    user: {},
    userId: null,
  };


}