# ubart-app
`ubart`&mdash;discover and share utility box art. A little side project while playing around with various Google Cloud services. 

## What does it do

`ubart` is an application where you can help submit utility box art locations and photos. Once a location is submitted and photos are uploaded, the photos are automatically analyzed to ensure they're not [NSFW content](https://en.wikipedia.org/wiki/Not_safe_for_work). All locations and boxes can then be searched by geolocation.

Overall it's a React SPA talking to a Flask server and various services, including, but not limited to: 

- [App Engine](https://cloud.google.com/appengine/) managed platform hosting the app
- [PubSub](https://cloud.google.com/pubsub/) for passing events between app components
- [Vision AI](https://cloud.google.com/vision/) for ensuring uploaded photos are safe
- [Imgur](https://imgur.com/) for image hosting

