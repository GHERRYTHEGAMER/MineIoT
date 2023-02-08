
var express = require('express');
var router = express.Router();
var sqlDB = require('../private/database/charts/chartSQLdb');
var cosmosDb = require('../private/database/charts/chartCosmosDB');
var manageDevice = require('../private/iotHub/devices/manageDevice');

/* GET home page. */
router.get('/', function(req, res, next) {
  
  var createFlag = req.query.created;
  var deviceExistsFlag = req.query.deviceExists;
  var alreadyChartFlag = req.query.alreadyChart;
  var deleteFlag = req.query.deleted;

  var email = req.headers["x-ms-client-principal-name"];
  if(email == Null || email === ""){
    email = 'manuei225225@gmail.com';
  }

  sqlDB.retriveByEmail(email).then( resultSet =>{
    var charts = [];

    /*resultSet.recordset.forEach( async chart => {
      
      var deviceId = chart.deviceId;
      var label = chart.label;
      console.log("%s\t%s", deviceId, label);

      var chartDict = {};

      chartDict.name = `${chart.deviceId} - ${chart.label}`;
      chartDict.deviceId = chart.deviceId;
      chartDict.label = chart.label;

      resultDict = await cosmosDb.chartTimeSeries(chart.label, chart.deviceId, 7200);

      labels = ["Mar 1", "Mar 2", "Mar 3", "Mar 4", "Mar 5", "Mar 6", "Mar 7", "Mar 8", "Mar 9", "Mar 10", "Mar 11", "Mar 12", "Mar 13"];
      chartDict.labels = resultDict.labels;

      data = [10000, 30162, 26263, 18394, 18287, 28682, 31274, 33259, 25849, 24159, 32651, 31984, 38451];
      chartDict.data = resultDict.values;

      charts.push(chartDict);
    }).then( resultForEach =>{
      res.render('charts'), {charts: charts, createFlag: createFlag, deviceExistsFlag: deviceExistsFlag, alreadyChartFlag: alreadyChartFlag, deleteFlag: deleteFlag};
    });*/

    const promiseArray = resultSet.recordset.map(async chart => {
      console.log(chart)
      var chartDict = {};

      chartDict.name = `${chart.deviceId} - ${chart.label}`;
      chartDict.deviceId = chart.deviceId;
      chartDict.label = chart.label;

      resultDict = await cosmosDb.chartTimeSeries(chart.label, 'device-1', 7200);
      var dates = [];
      for(timeStamp of resultDict.labels){
        var date= new Date(timeStamp * 1000);
        var dataFormat = date.getDate()+
        "/"+(date.getMonth()+1)+
        "/"+date.getFullYear()+
        " "+date.getHours()+
        ":"+date.getMinutes()+
        ":"+date.getSeconds();
        dates.push(dataFormat);
      }
      chartDict.labels = dates;
      chartDict.data = resultDict.values;
      
      charts.push(chartDict);
    });
    
    Promise.all(promiseArray)
      .then(() => {
        for (test of charts){
          console.log(test);
        }
        res.render('charts', {charts: charts, createFlag: createFlag, deviceExistsFlag: deviceExistsFlag, alreadyChartFlag: alreadyChartFlag, deleteFlag: deleteFlag});
    });
    
  });

});

// --- CREATE ----------------------------------------------------------------------------------------------
router.get('/create', function(req, res, next){
  console.log("createChart");

  var email = req.headers["x-ms-client-principal-name"];
  if(email == Null || email === ""){
    email = 'manuei225225@gmail.com';
  }
  const deviceName = req.query.deviceName;
  const label = req.query.label;

  console.log(email);
  console.log(deviceName);
  console.log(label)

  var check = false;
  if(deviceName == null || deviceName === ""){
    res.redirect(req.baseUrl + `?created=${check}`);
    return;
  }
  if(label == null || label === ""){
    console.log("entrato");
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

  manageDevice.queryDevice(query).then( resultDevice => {
    var device = JSON.parse(resultDevice);
    if(device.length == 0){
      console.log("No device with that name");
      res.redirect(req.baseUrl + `?deviceExists=${check}`);
      return;
    }
    const deviceId = device[0].deviceId;
    
    sqlDB.countByKeys(deviceId, label).then(resultCount => {
      if(resultCount.recordset[0].count > 0){
        console.log("This chart already exists");
        res.redirect(req.baseUrl + `?alreadyChart=${check}`);
        return;
      }
      sqlDB.createChart(deviceId,label,email).then(resultCreate =>{
        if(resultCreate !=false){
          console.log(resultCreate)
          console.log(`Created: ${deviceId} ${label} ${email}`);
          check = true;
        }
        res.redirect(req.baseUrl + `?created=${check}`);
        return;
      });

    });

  });

});

// --- DELETE ----------------------------------------------------------------------------------------------
router.get('/delete', function(req, res, next){
  console.log("deleteChart");

  const deviceId = req.query.deviceId;
  const label = req.query.label;

  var check = false;

  if(deviceId == null || deviceId === ""){
    res.redirect(req.baseUrl + `?deleted=${check}`);
    return;
  }

  if(label == null || label === ""){
    res.redirect(req.baseUrl + `?deleted=${check}`);
    return;
  }

  sqlDB.deleteChart(deviceId, label).then( resultDelete =>{
    if(resultDelete != false){
      check = true;
    }
    res.redirect(req.baseUrl + `?deleted=${check}`);
  });

});

router.get('*', function(req, res, next) {
  console.log("********************************");
  res.redirect('/charts');
});

module.exports = router;

