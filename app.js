'use strict'
require('dotenv').config()
const express = require('express')()
const crops = require('./crops')

start()

function start () {
  let port = process.env.PORT || 8080

  express
  .get('/crop/:w/:h/*', (req, res) => crops.crop(req, res, false))
  .get('/smart/:w/:h/*', (req, res) => crops.crop(req, res, true))

  express.listen(port, () => console.log(`Crops listening on port ${port}`))
}
