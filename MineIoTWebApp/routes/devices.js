var express = require('express');
var router = express.Router();
var manageDevice = require('../private/iotHub/devices/manageDevice');

/* GET home page. */
router.get('/', function(req, res, next) {

  var createFlag = req.query.created;
  var deleteFlag = req.query.deleted;
  var nameFlag = req.query.nameFlag;

  var email = req.headers["x-ms-client-principal-name"];
  if(email == null || email === ""){
    email = 'manuei225225@gmail.com';
  }
  

  var query = {
    "query": `
    SELECT devices.deviceId, devices.tags.user, devices.tags.name
      FROM devices
      WHERE devices.tags.user = '${email}'
    `
  };
  
  manageDevice.queryDevice(query).then( async (result) => {
    var devices = JSON.parse(result);
    for (var i = 0; i < devices.length; i++) {
      var device = devices[i];
      var deviceId = device.deviceId;
      var connectionString = await manageDevice.getConnectionString(deviceId);
      device.connectionString = connectionString;
      if (connectionString === false) {
        devices.splice(i, 1);
        i--;
      }
    }
    console.log(devices);
    res.render('devices', {devices: devices, createFlag: createFlag, deleteFlag: deleteFlag, nameFlag: nameFlag});
  });
});

// --- CREATE ----------------------------------------------------------------------------------------------
router.get('/create', function(req, res, next){
  console.log("createDispositivo");

  var email = req.headers["x-ms-client-principal-name"];
  if(email == null || email === ""){
    email = 'manuei225225@gmail.com';
  }
  const deviceName = req.query.deviceName;

  console.log(email);
  console.log(deviceName);

  var check = false;
  if(deviceName == null || deviceName === ""){
    res.redirect(req.baseUrl + `?created=${check}`);
    return;
  }

  var query = {
    "query": `
    SELECT devices.deviceId
      FROM devices
      WHERE devices.tags.user = '${email}'
      AND devices.tags.name = '${deviceName}'
    `
  };

  manageDevice.queryDevice(query).then((result) => {
    var count = JSON.parse(result);
    if(count.length > 0){
      console.log("Exists a device with same name");
      res.redirect(req.baseUrl + `?nameFlag=${check}`);
      return;
    }

    device_id = `${email}-${deviceName}`;
    
    device = {
        "deviceId": device_id,
        "status": "enabled",
        "tags": {
            "user": email,
            "name": deviceName
        }
    };
    
    manageDevice.createDevice(device).then((result) => {
      if(result == true){
        check = true;
      }
      res.redirect(req.baseUrl + `?created=${check}`);
    });    

  });

});

// --- DELETE ----------------------------------------------------------------------------------------------
router.get('/delete', function(req, res, next){
  console.log("deleteDispositivo");

  const deviceId = req.query.deviceId;

  var check = false;
  if(deviceId == null){
    res.redirect(req.baseUrl + `?deleted=${check}`);
    return;
  }
  
  manageDevice.deleteDevice(deviceId).then( (result) => {
    if(result == true){
      check = true;
    }
    res.redirect(req.baseUrl + `?deleted=${check}`);
  });

});

router.get('*', function(req, res, next) {
  res.redirect('/devices');
});

module.exports = router;