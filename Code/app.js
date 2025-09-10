/*
 * Copyright (c) 2014-2020 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

require('./lib/startup/validateDependencies')().then(() => {
  const server = require('./server')
  server.start()
})

const express = require('express');
const app = express();
const port = 3000;

app.get('/customerOnboarding', (req, res) => {
  const name = req.query.name;
  const uppercaseName = eval('"' + name + '"' + '.toUpperCase()');
