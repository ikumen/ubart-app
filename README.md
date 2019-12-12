# ubart-app
`ubart` is utility box art database, where you can discover and share utility box art. It was built as a side project while playing around with various Google Cloud services. 

## What does it do

The idea is pretty simple, use crowdsourcing to help populate a database of utility box locations and photos. Once a location is submitted and photos uploaded, the photos are automatically analyzed to ensure they're not NSFW content. All locations and boxes can then be searched by geolocation.

## How does it work

Overall it's a React SPA talking to a Flask server and various services, including, but not limited to: 

- [App Engine](https://cloud.google.com/appengine/) managed platform hosting the app
- [PubSub](https://cloud.google.com/pubsub/) for passing events between app components
- [Vision AI](https://cloud.google.com/vision/) for ensuring uploaded images are safe
- [Imgur](https://imgur.com/) for image hosting

