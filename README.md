## MyFavoriteShow.org - A BrowserID example site

This is a simple site that demonstrates how
[BrowserID](https://browserid.org) can be used to to accept verified
emails from users for the purposes of signup to email lists or fan
lists.

## Overview

BrowserID is a distributed system that allows users to use their email
address as login name and password.  Go read more about
[how browserid works] if you like.

  [how browserid works]: http://lloyd.io/how-browserid-works

This repository contains a sample that explores more fully a single
use case of browserid, namely using it as a means to allow users to
share verified email addresses with a site, so that sites easily implement
a "join our mailing list" feature in a robust manner - letting BrowserID
handle the problem of verifying that users actually own the email address
that they enter.

## The Implementation

MyFavoriteShow.org is a site dedicated to a fictional TV show
"The Great Identity Race".  Fans of the show can come to this site,
read a bunch about it, and their favorite stars of the show.
Additionally, users can choose to register or unregister for the show's
email list.  Registration leverages browserid to confirm that users
only register email addresses that they actually own.


### The API

The web services api exported by the node.js server consists of the following:

  * **`/api/register`** - registers an email address to the show's mailing list. 
  * **`/api/unregiser`** - unregisters an email address from the show's mailing list.

Further documentation of these calls is available in the source code. 

### Persistence

We have to store the email list *somewhere*.  mongodb is used
for this purpose and a very simple database abstraction layer exists
in `db.js`.  The details of interacting with the database aren't
important, but if you're curious have a look in db.js.

### Run it!

To run the example code locally:

  0. clone this repository 
  1. install node (0.4.7+) and npm.
  2. `npm install`
  3. `npm start`

On stdout you'll see an ip address and port, like `127.0.0.1:59275`.  Open that
up in your web browser.

**NOTE:** You'll see warnings about how no database is configured.
Don't worry about it.  The code is designed to run with or without a
configured database so that it's easier to play with.  The only
downside of running without a database is that your server won't
remember anything.  Oh well.

### Deployment

The code is designed to run on heroku's node.js hosting services, and
the only way this affects the implementation is via environment
variable naming choices and the presence of a `Procfile` which tells
heroku how to start the server.

If you'd like to deploy this service to heroku yourself, all you'd have to do is:

  1. set up a heroku account (and run through their tutorial)
  2. add a free mongolab instance (for persistence): `heroku addons:add mongolab:starter`
  3. set your app to bind to all available ips: `heroku config:add IP_ADDRESS=0.0.0.0`
  4. set a random string to encrypt cookies: `heroku config:add SEKRET=<long random string>`
  5. push the code up to heroku!

**NOTE:**  While the sample is targeted at heroku, with minimal code modifications it
should run under the hosting environment of your preference.

## Credit

Concept + Design(kinda): http://myfavouritesandwich.org/
