'use strict'
require('dotenv').config()
const express = require('express')()
const crops = require('./crops')

start()

function start () {
  let port = process.env.CROPS_PORT || 8080

  express
  .get('/crop/:w/:h/*', crops.crop)
  .get('/rcrop/:w/:h/*', crops.resizeAndCrop)
  .get('/resize', crops.resize)

  express.listen(port, () => console.log(`Crops listening on port ${port}`))
}
