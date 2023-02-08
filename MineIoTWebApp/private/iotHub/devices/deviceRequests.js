const https = require('https');
const api_version = "2020-05-31-preview";

module.exports = {
    createDeviceRequest: function(sasToken, resourceUri, device){
        if(!sasToken) throw new Error('Missing required argument: sasToken');
        if(!resourceUri) throw new Error('Missing required argument: resourceUri');
        if(!device) throw new Error('Missing required argument: device');

        console.log("createDeviceRequest");
        const path = `/devices/${device.deviceId}?api-version=${api_version}`;
        const headers = {
            "Content-Type": "application/json",
            "Authorization": sasToken
        };
        var options = {
            hostname: resourceUri,
            path: path,
            method: 'PUT',
            headers: headers
        };

        var req = https.request(options, (res) => {
            console.log(`statusCode: ${res.statusCode}`);
        
            res.on('data', (d) => {
                process.stdout.write(d);
            });
        });
        
        const deviceJSON = JSON.stringify(device);
        
        req.write(deviceJSON);
        req.end();

        return new Promise((resolve, reject) => {
            req.on("response", (res) => {
                if (res.statusCode !== 200) {
                    reject(`Request failed with status code ${res.statusCode}`);
                } else {
                    resolve();
                }
            });
            req.on("error", (error) => {
                reject(error);
            });
        });
    },

    deleteDeviceRequest: function(sasToken, resourceUri, deviceId){
        if(!sasToken) throw new Error('Missing required argument: sasToken');
        if(!resourceUri) throw new Error('Missing required argument: resourceUri');
        if(!deviceId) throw new Error('Missing required argument: deviceId');

        console.log("deleteDeviceRequest");
        const path = `/devices/${deviceId}?api-version=${api_version}`;
        const headers = {
            "Content-Type": "application/json",
            "Authorization": sasToken,
            "If-Match": "*"
        };
        var options = {
            hostname: resourceUri,
            path: path,
            method: 'DELETE',
            headers: headers
        };

        var req = https.request(options, (res) =>{
            console.log(`statusCode: ${res.statusCode}`);
        
            res.on('data', (d) => {
                process.stdout.write(d);
            });
        });

        req.end();
        return new Promise((resolve, reject) => {
            req.on("response", (res) => {
                if (res.statusCode !== 204) {
                    reject(`Request failed with status code ${res.statusCode}`);
                } else {
                    resolve();
                }
            });
            req.on("error", (error) => {
                reject(error);
            });
        });
    },

    updateTwinDeviceRequest: function(sasToken, resourceUri, device){
        if(!sasToken) throw new Error('Missing required argument: sasToken');
        if(!resourceUri) throw new Error('Missing required argument: resourceUri');
        if(!device) throw new Error('Missing required argument: device');

        console.log("updateTwinDeviceRequest");
        const path = `/twins/${device.deviceId}?api-version=${api_version}`;
        const headers = {
            "Content-Type": "application/json",
            "Authorization": sasToken,
        };
        var options = {
            hostname: resourceUri,
            path: path,
            method: 'PATCH',
            headers: headers
        };

        var req = https.request(options, (res) =>{
            console.log(`statusCode: ${res.statusCode}`);
        
            res.on('data', (d) => {
                process.stdout.write(d);
            });
        });
        
        const deviceJSON = JSON.stringify(device);
        
        req.write(deviceJSON);
        req.end();

        return new Promise((resolve, reject) => {
            req.on("response", (res) => {
                if (res.statusCode !== 200) {
                    reject(`Request failed with status code ${res.statusCode}`);
                } else {
                    resolve();
                }
            });
            req.on("error", (error) => {
                reject(error);
            });
        });
    },

    replaceTwinDeviceRequest: function(sasToken, resourceUri, device){
        if(!sasToken) throw new Error('Missing required argument: sasToken');
        if(!resourceUri) throw new Error('Missing required argument: resourceUri');
        if(!device) throw new Error('Missing required argument: device');

        console.log("replaceTwinDeviceRequest");
        const path = `/twins/${device.deviceId}?api-version=${api_version}`;
        const headers = {
            "Content-Type": "application/json",
            "Authorization": sasToken
        };
        var options = {
            hostname: resourceUri,
            path: path,
            method: 'PUT',
            headers: headers
        };

        var req = https.request(options, (res) =>{
            console.log(`statusCode: ${res.statusCode}`);
        
            res.on('data', (d) => {
                process.stdout.write(d);
            });
        });
        
        const deviceJSON = JSON.stringify(device);
        
        req.write(deviceJSON);
        req.end();

        return new Promise((resolve, reject) => {
            req.on("response", (res) => {
                if (res.statusCode !== 200) {
                    reject(`Request failed with status code ${res.statusCode}`);
                } else {
                    resolve();
                }
            });
            req.on("error", (error) => {
                reject(error);
            });
        });
    },

    queryDeviceRequest: function(sasToken, resourceUri, query){
        if(!sasToken) throw new Error('Missing required argument: sasToken');
        if(!resourceUri) throw new Error('Missing required argument: resourceUri');
        if(!query) throw new Error('Missing required argument: query');

        console.log("queryDeviceRequest");
        const path = `/devices/query?api-version=${api_version}`;
        const headers = {
            "Content-Type": "application/json",
            "Authorization": sasToken
        };
        
        var options = {
            hostname: resourceUri,
            path: path,
            method: 'POST',
            headers: headers
        };        

        let requestData = '';
        var req = https.request(options, (res) => {
            console.log(`statusCode: ${res.statusCode}`);
        
            res.setEncoding('utf8');
            
            res.on('data', (chunk) => {
                requestData += chunk;
            });
            
        });
        
        let queryJSON = JSON.stringify(query);
        
        req.write(queryJSON);
        req.end();

        return new Promise((resolve, reject) => {
            req.on("response", (res) => {
                if (res.statusCode !== 200) {
                    reject(`Request failed with status code ${res.statusCode}`);
                } else {
                    res.on('end', () => {
                        resolve(requestData);
                    });
                }
            });
            req.on("error", (error) => {
                reject(error);
            });
        });
    },

    getDeviceRequest: function(sasToken, resourceUri, deviceId){
        if(!sasToken) throw new Error('Missing required argument: sasToken');
        if(!resourceUri) throw new Error('Missing required argument: resourceUri');
        if(!deviceId) throw new Error('Missing required argument: deviceId');

        console.log("getDeviceRequest " + deviceId);
        const path = `/devices/${deviceId}?api-version=${api_version}`;
        const headers = {
            "Content-Type": "application/json",
            "Authorization": sasToken
        };
        
        var options = {
            hostname: resourceUri,
            path: path,
            method: 'GET',
            headers: headers
        };        

        let requestData = '';
        var req = https.request(options, (res) => {
            console.log(`statusCode: ${res.statusCode}`);
        
            res.setEncoding('utf8');
            

            res.on('data', (chunk) => {
                requestData += chunk;
            });
            
        });
        
        req.end();

        return new Promise((resolve, reject) => {
            req.on("response", (res) => {
                if (res.statusCode !== 200) {
                    reject(`Request failed with status code ${res.statusCode}`);
                } else {
                    res.on('end', () => {
                        resolve(requestData);
                    });
                }
            });
            req.on("error", (error) => {
                reject(error);
            });
        });
    }
}