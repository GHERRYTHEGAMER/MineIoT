const { CosmosClient } = require("@azure/cosmos");

//stinga di connessione a cosmosDB
const endpoint = "your-end-point-here";
const key = "your-key-here";
const client = new CosmosClient({ endpoint, key });

//Db e Container names (cosmosDB)
const database = 'your-database-name-here'
const container = 'your-container-name-here'

module.exports = {
    chartTimeSeries: async function(label,deviceid,interval){
        // prendo il current timestamp
        let currentDate = new Date();
        let timestamp = currentDate.getTime();
    
        // connessione e query
        let risultato = await connectAndyQueryCosmos(database,container,label,1,timestamp,deviceid);
    
        return averageValues(risultato,interval)
    }
}


// funzione che effettua la media dei periodi
function averageValues(inputs, interval) {
    let keyVal = Object.keys(inputs)[0];
    let keyLab = Object.keys(inputs)[1];

    let results = {};
    results.values = [];
    results.labels = [];

    let nextTimestamp = inputs[keyLab][0] + interval;
    let sum = 0;
    let count = 0;
    let i = 0;
    

    while (i < inputs[keyLab].length) {
        if (inputs[keyLab][i] > nextTimestamp) {
            if(count>0){
                results.values.push(sum / count);
                results.labels.push(nextTimestamp);
            }
            sum = 0;
            count = 0;
            nextTimestamp = nextTimestamp + interval;
        } else {
            sum += inputs[keyVal][i];
            count++;
            i++;
        }
    }
    if (count > 0) {
        results.values.push(sum / count);
        results.labels.push(nextTimestamp);
    }
    return results;
}

// funzione per effettuare la connessione al cosmosDB ed eseguire la query
async function connectAndyQueryCosmos(db,ct,label,start,end,deviceid) {
    try{
        var databasehubiot = await client.database(db)
        var container1 = await databasehubiot.container(ct)

        var label = label;
        var start = start;
        var end = end;
        var deviceid = deviceid;

        var QUERY = `SELECT c.${label} as y,c._ts as x FROM c 
        WHERE 
        (c._ts BETWEEN ${start} AND ${end}) AND 
        (c.IoTHub.ConnectionDeviceId='${deviceid}') AND 
        (IS_DEFINED(c.${label}))
        order 
        by c._ts asc`
        var items = await container1.items.query(QUERY).fetchAll();
        var results = {};
        results.y = [];
        results.x = [];
        if(items.resources.length>0){
            for (item of items.resources){
                results.y.push(item.y)
                results.x.push(item.x)
            }
        }
        return results;
    } catch (error) {
        console.error(error.message);
        return false;
    }
}


