const sql = require('mssql');

const config = {
    user: 'your-user-name', // better stored in an app setting such as process.env.DB_USER
    password: 'your-password', // better stored in an app setting such as process.env.DB_PASSWORD
    server: 'your-sql-server-name.database.windows.net', // better stored in an app setting such as process.env.DB_SERVER
    port: 1433, // optional, defaults to 1433, better stored in an app setting such as process.env.DB_PORT
    database: 'your-database-name', // better stored in an app setting such as process.env.DB_NAME
    authentication: {
        type: 'default'
    },
    options: {
        encrypt: true
    }
};

module.exports = {
    connectAndQuery: async function(query){
        try {
            var poolConnection = await sql.connect(config);
    
            console.log("connectAndQuery: Executing Query");
            var resultSet = await poolConnection.request().query(query);
            
            return resultSet;

        } catch (err) {
            console.error(err.message);
            return false;
        }
    },

    retriveByEmail: async function(email){
        var query = `
        SELECT deviceId, label 
        FROM CHARTS 
        WHERE email = '${email}'`;
        return this.connectAndQuery(query);
    },

    // return resultCount, resultCount.recordset[0].count for get the count
    countByKeys: async function(deviceId, label){
        var query = `
        SELECT COUNT(*) as count
        FROM CHARTS
        WHERE deviceid = '${deviceId}'
        AND label = '${label}'`;
        return this.connectAndQuery(query);
    },

    createChart: async function(deviceId, label, email){
        var query = `
        INSERT INTO CHARTS (deviceId, label, email)
        VALUES ('${deviceId}', '${label}', '${email}');`;
        return this.connectAndQuery(query);
    },

    deleteChart: async function(deviceId, label){
        var query = `
        DELETE
        FROM CHARTS
        WHERE deviceid = '${deviceId}'
        AND label = '${label}'`;
        return this.connectAndQuery(query);
    },
}