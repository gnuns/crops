# crops
Simple image crop and resize server

### Config
.env variables:
```
PORT=1337
BASE_SERVER=http://s3.amazonaws.com/
```
### Clone & install dependencies
```sh
sudo apt-get install imagemagick graphicsmagick
git clone git@github.com:gnuns/crops.git
cd crops/
npm install
```

### Run!
```
npm start
```
## credits
based on [zooniverse/static-crop](https://github.com/zooniverse/static-crop)
