#User Authentication with Passport

Modified from https://scotch.io/tutorials/easy-node-authentication-setup-and-local.
For a detailed step-by-step, follow the scotch.io tutorial.

This version will use local, Facebook, Twitter, and Google login/reg - built on Node.js/Express/MongoDB. The file structure will NOT match the scotch.io tutorial as I have modified it quite a bit while building.

**For user authentication on AngularJS (with Node), look here: [Angular Authentication](https://github.com/nikki-b/angular_authentication).

##Don't forget the auth.js file!

Create a file, auth.js, in the server/config folder.
Here is the template for it:

```
module.exports = {
  'facebookAuth' : {
    'clientID'      : 'your-secret-clientID-here', 
    'clientSecret'  : 'your-client-secret-here',
    'callbackURL'   : 'http://localhost:8888/auth/facebook/callback'
  },
  'twitterAuth' : {
    'consumerKey'       : 'your-secret-consumerKey-here',
    'consumerSecret'    : 'your-consumer-secret-here',
    'callbackURL'       : 'http://localhost:8888/auth/twitter/callback'
  },
  'googleAuth' : {
    'clientID'      : 'your-secret-clientID-here',
    'clientSecret'  : 'your-client-secret-here',
    'callbackURL'   : 'http://localhost:8888/auth/google/callback'
  }
};
```

The secret IDs/keys/etc are provided by the developer consoles for each service.

##Developer Consoles
Facebook: http://developers.facebook.com
Twitter: http://apps.twitter.com
Google: https://developers.google.com/identity/sign-in/web/devconsole-project
(Make sure that you also enable the Google+ API for Google login.)