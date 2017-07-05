var http = require('http'),
    config = require('./config.js'),
    serverTimeout = config.serverTimeout,
    i = 0,
    servers = config.servers,
    Promise = require('es6-promise').Promise,
    myProxy = require('./proxy.js');

var setServerUp = function(server){
    server.isDown = false;
    server.downTime = 0;
};
var setServerDown = function(server){
    server.isDown = true;
    server.downTime = new Date();
};
var serverDown = function(server, message){
    console.log(message);
    setServerDown(server);
};

var isUpServer = function(server){
    console.log("check status for server with port: " + server.port);
    return new Promise(function(resolve, reject){
        if(server.isDown){
            console.log("server was down. Checking again...");
            var dif = (new Date()).getTime() - server.downTime.getTime();
            var Seconds_from_T1_to_T2 = dif / 1000;
            var Seconds_Between_Dates = Math.abs(Seconds_from_T1_to_T2);
            if (Seconds_Between_Dates < server.retryConnection){
                serverDown(server, "Too soon, check again later");
                return reject(false);
            }
        }
        var target = 'http://localhost:' + server.port + '/running';
        var req = http.request(target, function (res) {
            if (res.statusCode == 200) {
                console.log("server seems to be up");
                setServerUp(server);
                return resolve(server)
            } else {
                serverDown(server, "server check is down, status code: " + res.statusCode);
                return reject(e);
            }
        });

        req.on('error', function (e) {
            serverDown(server, "Got error: " + e.message);
            return reject(e);
        });

        req.on('timeout', function (e) {
            serverDown(server, 'timeout, server seems to be down');
            req.abort();
            return reject(e);
        });
        req.setTimeout(serverTimeout);
        req.end();
    });
};


var redirect = function(server, req, res){
    myProxy.redirect(server, req, res).then(function() {
        console.log("request redirected successfully via port " + server.port);
    }).catch(function(err){
        serverDown(server, "Error when proxying. Error msg: " + err);
        i = (i + 1) % servers.length;
        server = servers[i];
        if (req.method == 'GET')
            searchAndRedirect(server, req, res);
    });
};

var searchAndRedirect = function(server, req, res){
    isUpServer(server).then(function() {
        i++;
        //if a volar
        if (i === servers.length - 1){
            i = i % servers.length;
            return;
        }
        i = i % servers.length;
        redirect(server, req, res);
    })
    .catch(function(err){
        //console.log("server with port " + server.port +  " is down... Error msg: " + err);
        i = (i + 1) % servers.length;
        server = servers[i];
        if (req.method == 'GET')
            searchAndRedirect(server, req, res);
    });
};


http.createServer(function(req, res) {
    var server = servers[i];
    searchAndRedirect(server, req, res);
}).listen(config.balancerPort, function() {
    console.log('proxy listening on port ' + config.balancerPort);
});
