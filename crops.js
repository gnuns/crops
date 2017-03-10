'use strict'
const get = require('request').get
const gm = require('gm').subClass({imageMagick: true})
const fs = require('fs')

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
  8: 'SouthEast'
}

module.exports = { softCrop }

function softCrop (req, res) {
  res.set('X-Powered-By', 'Crops')

  let params = req.params
  let gravity = req.query.gravity || 'Center'
  let quality = req.query.quality || 100

  // int gravity to the matching string value
  if (!isNaN(parseInt(gravity))) gravity = gravityMap[gravity]
  if (isNaN(parseInt(quality))) quality = 100
  if (params.w > MAX_CROP_WIDTH || params.h > MAX_CROP_HEIGHT) {
    res
    .status(500)
    .send(`Error! max width: ${MAX_CROP_WIDTH}, max height: ${MAX_CROP_HEIGHT}`)
  }

  downloadImage(params[0])
  .then((img) => {
    gm(img.path)
    .quality(quality)
    .resize(params.w, params.h, '^')
    .gravity(gravity)
    .crop(params.w, params.h)
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
