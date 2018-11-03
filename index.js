'use strict';

const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');

var credentials =
{
	key: fs.readFileSync('./ssl/key.pem'),
	cert: fs.readFileSync('./ssl/cert.pem')
};

const httpPort = 8080;
const httpsPort = 8081;

var handlers = {};
handlers.get = {};

handlers.unhandled = function(cb) {
	cb(400, "{'result':'bad request'}");
};

handlers.get.hello = function(cb) {
	cb(200, "{'PI':3.1416}");
};

function chooseHandler(method, route) {
        if( (typeof(handlers[method]) !== 'undefined') && 
	(typeof(handlers[method][route]) !== 'undefined')) 
	{
			return handlers[method][route];
        }
        else return handlers.unhandled; 
}

function serverFunction(req, res) {

        const method = req.method.toLowerCase();
        const parsedURL = url.parse(req.url, true);
        const trimmedPath = parsedURL.pathname.replace(/^\/+|\/+$/g, '');

        const handler = chooseHandler(method, trimmedPath);
        handler(function(code, data) {
                res.setHeader('Content-Type', 'application/json');
                res.writeHead(code);
                res.end(data);
        });

}

var httpsServer = https.createServer(credentials, serverFunction);
httpsServer.listen(httpsPort, function() {
        console.log("HTTPS REST API running on port " + httpsPort);
});

var httpServer = http.createServer(serverFunction);
httpServer.listen(httpPort, function() {
        console.log("HTTP REST API running on port " + httpPort);
});
