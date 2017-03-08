'use strict'
const get = require('request').get
const gm = require('gm').subClass({imageMagick: true})
const fs = require('fs')

const MAX_CROP_WIDTH = 2000
const MAX_CROP_HEIGHT = 2000

module.exports = { softCrop }

function softCrop (req, res) {
  let params = req.params

  res.set('X-Powered-By', 'Crops')

  if (params.w > MAX_CROP_WIDTH || params.h > MAX_CROP_HEIGHT) {
    res
    .status(500)
    .send(`Error! max width: ${MAX_CROP_WIDTH}, max height: ${MAX_CROP_HEIGHT}`)
  }

  downloadImage(params[0])
  .then((img) => {
    gm(img.path)
    .resize(params.w, params.h, '^')
    .gravity(req.query.gravity || 'Center')
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
