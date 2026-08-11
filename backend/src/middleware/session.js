const SESSION_COOKIE_NAME = 'facefile_user_id';

/**
 * Attaches req.userId from the signed session cookie, falling back to a
 * `userId` query param for backward-compatibility during the migration
 * period. Never blocks the request — routes that need a real user still
 * fall back to their own DEFAULT_USER_ID when req.userId is undefined.
 */
function sessionMiddleware(req, res, next) {
  const cookieValue = req.signedCookies?.[SESSION_COOKIE_NAME];
  if (cookieValue) {
    req.userId = Number(cookieValue);
  } else if (req.query.userId) {
    req.userId = Number(req.query.userId);
  }
  next();
}

module.exports = { sessionMiddleware, SESSION_COOKIE_NAME };
