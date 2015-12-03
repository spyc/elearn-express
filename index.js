'use strict';

var express = require('express');
var app = express();

var redis = require('redis');
var client = redis.createClient(1026, '127.0.1.8');

app.get('/link/:id', function(request, response) {
  const hash = 'link:' + request.params.id;
  client.hexists(hash, 'url', function(error, exists) {
    if (error || !exists) {
      response.status(404).send('Not Found');
      response.end();
    } else {
      var now = new Date();
      client.hget(hash, 'url', function (error, url) {
        response.redirect(url);
        response.end();
      });
      client.hincrby(hash, 'click', 1);
      client.hincrby(hash, now.getMonth() + ':' + now.getFullYear(), 1);
      client.lpush(hash + ':record', now.getTime() + '|' + request.get('User-Agent'));
    }
  });
});

var server = app.listen(5000, '127.0.1.4', function() {
  var address = server.address();
  const host = address.address;
  const port = address.port;

  console.log('Listen at %s:%d', host, port);
});
