"use strict";

var _routes = require("./routes");
var _db = require("./db");
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.use(express.json({
  limit: '50mb'
}));
var PORT = process.env.PORT || 8080;
var cors = require('cors');
app.use(cors({
  origin: '*'
}));
_routes.Routes.forEach(function (Route) {
  return app[Route.method](Route.path, Route.handler);
});
(0, _db.connectToDB)().then(function () {
  app.listen(PORT, function () {
    return console.log("Server Up!");
  });
});