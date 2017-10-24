const got = require('got')
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
  9: 'Smart'
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
    .send(`Error: max width: ${MAX_CROP_WIDTH}, max height: ${MAX_CROP_HEIGHT}`)
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
        res.status(500).send(`Error: ${err}`)
      }
    })
  })
  .catch((err) => res.status(500).send(`Error: ${err}`))
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

function mountURL (url, path) {
  url += `${(url.endsWith('/') ? '' : '/')}${path}`
  return url
}

function writeFile (file) {
  if (!fs.existsSync('tmp/')) fs.mkdirSync('tmp/')
  if (!file.type.startsWith('image')) throw 'Wrong file type!'
  let path = `tmp/crops-${Math.random()}.${file.type.split('/').pop()}`
  fs.writeFileSync(path, file.content, 'binary')
  return path
}

async function requestFile (url) {
  let response = await got(url, {encoding: 'binary'})
  if (!response.body || response.statusCode !== 200) throw 'Request failed!'
  return {type: response.headers['content-type'], content: response.body}
}

async function downloadImage (location) {
  let url = mountURL(process.env.BASE_SERVER, location)
  let file  = await requestFile(url)
  let path = writeFile(file)
  return {path, type: file.type}
}
