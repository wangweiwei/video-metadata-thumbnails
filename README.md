# **Video Metadata & Thumbnails**
Convenience method(or Video object) to get metadata and thumbnails of HTML5 video or audio(only metadata) Blob.

## **Installation**

```shell
npm install --save video-metadata-thumbnails
```

or

```
yarn add video-metadata-thumbnails
```

## **Usage**

### getMetadata method &  getThumbnails method

​	Add `video-metadata-thumbnails.iife.js` to your document and get the metadata or thumbnails value of the promise returned by `then`:

```html
<script src="your cdn path/video-metadata-thumbnails.iife.js"></script>
<script>
getMetadata(blob).then(function(metadata) {
  console.log('Metadata: ', metadata);
})
getThumbnails(blob).then(function(thumbnails) {
  console.log('Thumbnails: ', thumbnails);
})
</script>
```

​	Alternatively, you can import(or require) `video-metadata-thumbnails` by getting it from `npm` :

```javascript
import { getMetadata, getThumbnails } from 'video-metadata-thumbnails';
  
const metadata = await getMetadata(blob);
const thumbnails = await getThumbnails(blob);
console.log('Metadata: ', metadata);
console.log('Thumbnails: ', thumbnails);
```
### Video Object

​	Import(or require) `video-metadata-thumbnails` by getting it from `npm`

```      javascript
import { Video } from 'video-metadata-thumbnails';

const video = new Video(blob);
console.log('Metadata:', await video.getMetadata());
console.log('Thumbnails:', await video.getThumbnails())
```

## **getThumbnails' Options**

* quality
  * type: number
  * default: 0.7
  * description: video thumbnails' quality
* interval
  * type: number
  * default: 1
  * description: time interval
* scale
  * type: number
  * default: 0.7
  * description: video thumbnails' scale
* start
  * type: number
  * default: 0
  * description: start frame
* end
  * type: number
  * default: 0
  * description: the end of frame

## **License**

Copyright (c) 2020-present, Weiwei Wang 
