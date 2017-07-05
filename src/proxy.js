var http = require('http'),
    config = require('./config.js'),
    serverTimeout = config.serverTimeout;

module.exports = {

    redirect: function(server, request, response) {
        console.log("proxying...");
        return new Promise(function(resolve, reject){
            var proxyRequest = http.request('http://localhost:' + server.port + request.url, function(proxyResponse) {
                if (proxyResponse.statusCode == 200) {
                    response.writeHead(proxyResponse.statusCode, proxyResponse.headers);
                    proxyResponse.pipe(response);
                    return resolve(server);
                } else{
                    return reject("server error, responded with status code: " + proxyResponse.statusCode);
                }
            });
            Object.keys(request.headers).forEach(function(headerName) {
                var val = request.headers[headerName];
                proxyRequest.setHeader(headerName, val);
            });
            proxyRequest.setHeader('balancer', '1');
            proxyRequest.on('error', function (e) {
                return reject("Got server error: " + e.message);
            });

            proxyRequest.on('timeout', function (e) {
                proxyRequest.abort();
                return reject('server has timed out');
            });
            proxyRequest.setTimeout(serverTimeout);

            request.pipe(proxyRequest);
        });
    }
};
