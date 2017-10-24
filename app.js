require('dotenv').config()
const express = require('express')()
const crops = require('./lib/crops')
const port = process.env.PORT || 8080


express.get('/crop/:w/:h/*', crops.crop)
express.listen(port, () => console.log(`Crops listening on port ${port}`))
