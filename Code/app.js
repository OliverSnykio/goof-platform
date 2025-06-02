/*
 * Copyright (c) 2014-2020 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

require('./lib/startup/validateDependencies')().then(() => {
  const server = require('./server')
  server.start()
})


// validates if input email and password are correct
function checkLogin(req, db) {
  const sqlQuery =
    "SELECT email FROM credentials WHERE " +
    "email='" + req.body.email + "' AND " +
    "password='" + req.body.password + "'";

  db.query(sqlQuery, (err, result) => {
    if (err) {
      return false;
    }

    return result.length !== 0;
  });
}
