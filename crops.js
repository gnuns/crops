'use strict'
const get = require('request').get
const gm = require('gm').subClass({imageMagick: true})
const fs = require('fs')

const MAX_CROP_WIDTH = 2000
const MAX_CROP_HEIGHT = 2000

module.exports = { softCrop }

function softCrop (req, res) {
  let params = req.params
  if (params.w > MAX_CROP_WIDTH || params.h > MAX_CROP_HEIGHT) {
    res
    .status(500)
    .send(`Error! max width: ${MAX_CROP_WIDTH}, max height: ${MAX_CROP_HEIGHT}`)
  }
  downloadImage(params[0])
  .then((imgPath) => {
    gm(imgPath)
    .resize(params.w, params.h, '^')
    .gravity('Center')
    .crop(params.w, params.h)
    .stream((err, stdout, stderr) => {
      if (err) return res.status(500).send(err)
      try {
        setTimeout(() => fs.unlink(imgPath), 1500)
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

  let url = `${process.env.BASE_SERVER}/${path}`
  return new Promise((resolve, reject) => {
    get(url, {encoding: 'binary'}, (err, response) => {
      if (err || response.statusCode !== 200) return reject(err)
      let type = response.headers['content-type'].split('/')
      if (type[0] === 'image') {
        let file = `tmp/crops-${Math.random()}.${type[1]}`
        try {
          fs.writeFile(file, response.body, 'binary', (err) => {
            if (err) return reject(err)
            return resolve(file)
          })
        } catch (e) {
          return reject(e)
        }
      }
    })
  })
}
