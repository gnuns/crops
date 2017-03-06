'use strict'
const get = require('request').get
const gm = require('gm').subClass({imageMagick: true})
const fs = require('fs')

const MAX_CROP_WIDTH = 2000
const MAX_CROP_HEIGHT = 2000

module.exports = { crop, resizeAndCrop, resize }

function crop (req, res) {

}

function resizeAndCrop (req, res) {
  let params = req.params
  if (params.w > MAX_CROP_WIDTH || params.h > MAX_CROP_HEIGHT) {
    res
    .status(500)
    .error(`Error! max width: ${MAX_CROP_WIDTH}, max height: ${MAX_CROP_HEIGHT}`)
  }
  downloadImage(params[0])
  .then((imgPath) => {
    gm(imgPath)
    .resize(params.w, params.h, '^')
    .gravity('Center')
    .crop(params.w, params.h)
    .stream((err, stdout, stderr) => {
      if (err) return res.status(500).send(err)
      stdout.pipe(res)
    })
  })
  .catch((err) => res.status(500).error(`Error! ${err}`))
}

function resize (req, res) {

}

function downloadImage (path) {
  let url = `${process.env.CROPS_BASE_SERVER}/${path}`
  return new Promise((resolve, reject) => {
    get(url, {encoding: 'binary'}, (err, response) => {
      if (err || response.statusCode !== 200) return reject(err)
      let type = response.headers['content-type'].split('/')
      if (type[0] === 'image') {
        let file = `/tmp/crops-${Math.random()}.${type[1]}`
        fs.writeFile(file, response.body, 'binary', (err) => {
          if (err) return reject(err)
          return resolve(file)
        })
      }
    })
  })
}
