# crops
Simple image crop and resize server

### Clone & install dependencies
```sh
sudo apt-get install imagemagick graphicsmagick
git clone git@github.com:gnuns/crops.git
cd crops/
npm install
```

### Usage:
Set the .env variables:
```
PORT=1337
BASE_SERVER=http://cdn.example.com/
```

Run!
```
npm start
```

To crop the image:
`http://cdn.example.com/blah/awsome/potatoe.jpg`

You just have to access
`http://localhost:1337/crop/200/400/blah/awsome/potatoe.jpg`


You can also set the crop gravity:
`http://localhost:1337/crop/200/400/blah/awsome/potatoe.jpg?gravity=North` or
`http://localhost:1337/crop/200/400/blah/awsome/potatoe.jpg?gravity=2`

And quality (1-100):
`http://localhost:1337/crop/200/400/blah/awsome/potatoe.jpg?quality=70`


#### Valid gravity values:
* 0 / **Center** (default)
* 1 / NorthWest
* 2 / North
* 3 / NorthEast
* 4 / West
* 5 / East
* 6 / SouthWest
* 7 / South
* 8 / SouthEast


### Live demo

I setup a live demo on heroku  with `BASE_SERVER` param as `http://`, so you can view a cropped version of any image on the web using the URL without http://

Address: `https://crops.herokuapp.com/crop/`

#### Example:

![Original cat](http://68.media.tumblr.com/4e097c1aba3644c09121b28c3fc2d468/tumblr_mgtkitzs2I1qlp8dho1_1280.jpg)

`Image: http://68.media.tumblr.com/4e097c1aba3644c09121b28c3fc2d468/tumblr_mgtkitzs2I1qlp8dho1_1280.jpg`

![Square cat](https://crops.herokuapp.com/crop/300/300/68.media.tumblr.com/4e097c1aba3644c09121b28c3fc2d468/tumblr_mgtkitzs2I1qlp8dho1_1280.jpg)

`Image 300x300: https://crops.herokuapp.com/crop/300/300/68.media.tumblr.com/4e097c1aba3644c09121b28c3fc2d468/tumblr_mgtkitzs2I1qlp8dho1_1280.jpg`

## credits
inspired by [zooniverse/static-crop](https://github.com/zooniverse/static-crop)
