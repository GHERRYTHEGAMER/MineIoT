const crypto = require('crypto')
const deviceRequest = require("./deviceRequests");

//Configuration Panel
const resourceUri = "your-iot-hub-uri-here";
const expiresInMins = 60;
const policyIoTOwner = {
    "policyName": "iothubowner",
    "signinKey": "your-key-here",
};

module.exports = {
    createDevice: async function(device){
        sasToken = generateSasToken(resourceUri, policyIoTOwner.signinKey, policyIoTOwner.policyName, expiresInMins);
        try{
            await deviceRequest.createDeviceRequest(sasToken, resourceUri, device);
        }catch(error){
            console.error(error);
            return false;
        }

        try{
            await deviceRequest.updateTwinDeviceRequest(sasToken, resourceUri, device);
        }catch(error){
            await this.deleteDevice(device.deviceId);
            console.error(error);
            return false;
        }
        return true;
    },
    
    deleteDevice: async function(deviceId){
        sasToken = generateSasToken(resourceUri, policyIoTOwner.signinKey, policyIoTOwner.policyName, expiresInMins);
        try{
            await deviceRequest.deleteDeviceRequest(sasToken, resourceUri, deviceId);
        }catch(error){
            console.error(error);
            return false;
        }
        return true;
    },

    queryDevice: async function(query){
        sasToken = generateSasToken(resourceUri, policyIoTOwner.signinKey, policyIoTOwner.policyName, expiresInMins);
        try{
            return await deviceRequest.queryDeviceRequest(sasToken, resourceUri, query)
        }catch(error){
            console.error(error);
            return false;
        }
    },

    getDevice: async function(deviceId){
        sasToken = generateSasToken(resourceUri, policyIoTOwner.signinKey, policyIoTOwner.policyName, expiresInMins);
        try{
            return await deviceRequest.getDeviceRequest(sasToken, resourceUri, deviceId);
        }catch(error){
            console.error(error);
            return false;
        }
    },

    getConnectionString: async function(deviceId){
        deviceJSON = await this.getDevice(deviceId);
        if(deviceJSON == false){
            return false;
        }
        var device = JSON.parse(deviceJSON);
        var connectionString = `HostName=${resourceUri};DeviceId=${deviceId};SharedAccessKey=${device.authentication.symmetricKey.primaryKey}`
        return connectionString;
    }
}


const generateSasToken = function(resourceUri, signingKey, policyName, expiresInMins) {
    resourceUri = encodeURIComponent(resourceUri);

    // Set expiration in seconds
    var expires = (Date.now() / 1000) + expiresInMins * 60;
    expires = Math.ceil(expires);
    var toSign = resourceUri + '\n' + expires;

    // Use crypto
    var hmac = crypto.createHmac('sha256', Buffer.from(signingKey, 'base64'));
    hmac.update(toSign);
    var base64UriEncoded = encodeURIComponent(hmac.digest('base64'));

    // Construct authorization string
    var token = "SharedAccessSignature sr=" + resourceUri + "&sig="
    + base64UriEncoded + "&se=" + expires;
    if (policyName) token += "&skn="+policyName;
    return token;
};


