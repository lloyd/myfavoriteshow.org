#!/usr/bin/env node

// require libraries that we depend on
const
express = require('express'),
path = require('path'),
postprocess = require('postprocess'),
db = require('./db.js'),
url = require('url'),
browseridClient = require('./browserid_client.js');

// the key with which session cookies are encrypted
const COOKIE_SECRET = process.env.SEKRET || 'you love, i love, we all love tv shows!';

// The IP Address to listen on.
const IP_ADDRESS = process.env.IP_ADDRESS || '127.0.0.1';

// The port to listen to.
const PORT = process.env.PORT || 0;

// localHostname is the address to which we bind.  It will be used
// as our external address ('audience' to which assertions will be set)
// if no 'Host' header is present on incoming login requests.
var localHostname = undefined;

// create a webserver using the express framework
var app = express.createServer();

// a global flag indicating whether we have persistence or not.
var havePersistence;

// do some logging
app.use(express.logger({ format: 'dev' }));

// parse post bodies
app.use(express.bodyParser());

// The next three functions contain some fancy logic to make it so
// we can run multiple different versions of myfavoriteshow on the
// same server, each which uses a different browserid server
// (dev/beta/prod):
function determineEnvironment(req) {
  if (req.headers['host'] === 'myfavoriteshow.org') return 'prod';
  else if (req.headers['host'] === 'beta.myfavoriteshow.org') return 'beta';
  else if (req.headers['host'] === 'dev.myfavoriteshow.org') return 'dev';
  else return 'local';
}

function determineBrowserIDURL(req) {
  // first defer to the environment
  if (process.env.BROWSERID_URL) return process.env.BROWSERID_URL;

  return ({
    prod:   'https://browserid.org',
    beta:   'https://diresworb.org',
    dev:    'https://dev.diresworb.org',
    local:  'https://dev.diresworb.org'
  })[determineEnvironment(req)];
}

// a substitution middleware allows us to easily point at different browserid servers
app.use(postprocess.middleware(function(req, body) {
  var browseridURL = determineBrowserIDURL(req);
  console.log("sub in:", browseridURL);
  return body.toString().replace(new RegExp("https://browserid.org", 'g'), browseridURL);
}));

app.post("/api/register", function (req, res) {
  browseridClient.verify({
    assertion: req.body.assertion,
    audience: req.headers['host'] ? req.headers['host'] : localHostname,
    verifier_url: determineBrowserIDURL(req)
  }, function(err, email) {
    if (err) {
      res.writeHead(401);
      res.end();
    } else {
      res.json({success: true, email: email});
    }
  });
});

// Tell express from where it should serve static resources
app.use(express.static(path.join(path.dirname(__dirname), "static")));

// connect up the database!
db.connect(function(err) {
  havePersistence = (err ? false : true);

  if (err) console.log("WARNING: running without a database means no persistence: ", err);

  // once connected to the database, start listening for connections
  app.listen(PORT, IP_ADDRESS, function () {
    var address = app.address();
    localHostname = address.address + ':' + address.port
    console.log("listening on " + localHostname);
  });
});
