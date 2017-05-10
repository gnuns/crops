'use strict'
const {get} = require('request')
const gm = require('gm').subClass({imageMagick: true})
const fs = require('fs')
const smartcrop = require('smartcrop-gm')

const MAX_CROP_WIDTH = 2000
const MAX_CROP_HEIGHT = 2000

const gravityMap = {
  0: 'Center',
  1: 'NorthWest',
  2: 'North',
  3: 'NorthEast',
  4: 'West',
  5: 'East',
  6: 'SouthWest',
  7: 'South',
  8: 'SouthEast',
  10: 'Smart'
}

module.exports = { crop }

function crop (req, res, smart) {
  res.set('X-Powered-By', 'Crops')

  let params = req.params

  params.gravity = req.query.gravity || 'Smart'
  params.quality = req.query.quality || 100


  // int gravity to the matching string value
  if (!isNaN(parseInt(params.gravity))) params.gravity = gravityMap[params.gravity]
  if (isNaN(parseInt(params.quality))) params.quality = 100
  if (params.w > MAX_CROP_WIDTH || params.h > MAX_CROP_HEIGHT) {
    res
    .status(500)
    .send(`Error! max width: ${MAX_CROP_WIDTH}, max height: ${MAX_CROP_HEIGHT}`)
  }

  let img
  let cropFunction = params.gravity == 'Smart' ? smartCrop : simpleCrop

  downloadImage(params[0])
  .then((_img) => {
    img = _img
    return cropFunction(params, img.path)
  })
  .then((_gm) => {
    _gm
    .quality(params.quality)
    .stream((err, stdout, stderr) => {
      if (err) return res.status(500).send(err)
      try {
        setTimeout(() => fs.unlink(img.path), 1500)
        res.set('Content-Type', img.type)
        stdout.pipe(res)
      } catch (e) {
        res.status(500).send(`Error! ${err}`)
      }
    })
  })
  .catch((err) => res.status(500).send(`Error! ${err}`))
}

function smartCrop (params, imgPath) {
  return new Promise((resolve, reject) => {
    let img = fs.readFileSync(imgPath)
    smartcrop
    .crop(img, {width: params.w, height: params.h})
    .then(function({topCrop}) {
      let _gm = gm(imgPath)
      _gm
      .crop(topCrop.width, topCrop.height, topCrop.x, topCrop.y)
      .resize(params.w, params.h)
      return resolve(_gm)
    })
    .catch(reject)
  })
}

function simpleCrop (params, imgPath) {
  return new Promise((resolve, reject) => {
    let _gm = gm(imgPath)
    _gm
    .resize(params.w, params.h, '^')
    .gravity(params.gravity)
    .crop(params.w, params.h)
    return resolve(_gm)
  })
}

function downloadImage (path) {
  if (!fs.existsSync('tmp/')) fs.mkdirSync('tmp/')

  let url = process.env.BASE_SERVER
  url += `${(url.endsWith('/') ? '' : '/')}${path}`

  return new Promise((resolve, reject) => {
    get(url, {encoding: 'binary'}, (err, response) => {
      if (err || response.statusCode !== 200) return reject(err)
      let type = response.headers['content-type'].split('/')
      if (type[0] === 'image') {
        let file = `tmp/crops-${Math.random()}.${type[1]}`
        try {
          fs.writeFile(file, response.body, 'binary', (err) => {
            if (err) return reject(err)
            return resolve({path: file, type: response.headers['content-type']})
          })
        } catch (e) {
          return reject(e)
        }
      }
    })
  })
}
