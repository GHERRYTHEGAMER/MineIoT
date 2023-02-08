function print_all_resource_group{
    az group list --query [].name
}


Write-Host "Azure Menu:"
$output = az account show
if(!$output){
    Write-Host "Non sei connesso!"
    az login
}
Write-Host "Sei connesso!"

:loop while (1){
    $scelta = Read-Host "
    1. Logout
    2. Create Default process for MineIoT Project
    3. Delete Default IoT Project
    Scegli opzione"
    
    switch($scelta){
        "1" {
            az logout
            break loop
        }
        "2" {

            # Add extension for az commands
            az extension add --name azure-iot
            az extension add --name stream-analytics

            # ------ Resource Group ------------------------------------------------------------------------
            $location = "westeurope"
            $resource_group_name = "MineIoT-resourceGroup"
            #$resource_group_name= "default-iot-project"
            Write-Host "Creating Resource Group: "$resource_group_name
            az group create -l $location -n $resource_group_name

            # ------ IoT Hub ------------------------------------------------------------------------
            $iot_hub_name = "MineIoT-IoTHub"
            #$iot_hub_name = "masa-default-iot-hub"
            Write-Host "Creating IoT Hub in "$resource_group_name": "$iot_hub_name
            az iot hub create -n $iot_hub_name -g $resource_group_name --sku "B1" --partition-count "2"
            #az iot hub create -n MineIoT-IoTHub -g default-iot-project --sku "B1" --partition-count "2"

            $iot_hub_policy_name = "iothubowner"
            $iot_hub_policy_key = (az iot hub policy show --hub-name $iot_hub_name -n $iot_hub_policy_name | ConvertFrom-Json).primaryKey

            # ------ CosmosDB ------------------------------------------------------------------------
            $cosmosDB_account_name = "mineiot-cosmosdb"
            #$cosmosDB_account_name = "masaniellocosmosdb"
            Write-Host "Creating CosmosDB in "$resource_group_name": "$cosmosDB_account_name
            az cosmosdb create -n $cosmosDB_account_name -g $resource_group_name
            #az cosmosdb create -n mineiot-cosmosdb -g default-iot-project

            $cosmosDB_database_name = "Mineiot-CosmosDB-database"
            $cosmosDB_container_name ="Log-IoT-devices"
            Write-Host "Creating database in "$cosmosDB_account_name": "$cosmosDB_database_name
            az cosmosdb sql database create -n $cosmosDB_database_name -a $cosmosDB_account_name -g $resource_group_name
            #az cosmosdb sql database create -n Mineiot-CosmosDB-database -a masaniellocosmosdb -g default-iot-project 
            az cosmosdb sql container create -n $cosmosDB_container_name --partition-key-path "/id" -d $cosmosDB_database_name -a $cosmosDB_account_name -g $resource_group_name
            #az cosmosdb sql container create -n Log-IoT-devices --partition-key-path "/id" -d Mineiot-CosmosDB-database -a masaniellocosmosdb -g default-iot-project
            $cosmosDB_primary_key = (az cosmosdb keys list -n $cosmosDB_account_name -g $resource_group_name | ConvertFrom-Json).primaryMasterKey
            #$cosmosDB_primary_key = (az cosmosdb keys list -n mineiot-cosmosdb -g default-iot-project | ConvertFrom-Json).primaryMasterKey


            # ------ Stream Analytics Job ------------------------------------------------------------------------
            $stream_analytics_job_name = "MineIoT-streamAnalyticsJob"
            Write-Host "Creating Stream Analytics Job in "$resource_group_name": "$stream_analytics_job_name
            az stream-analytics job create -n $stream_analytics_job_name -g $resource_group_name --transformation name="transformationSAJ" streaming-units=1
            #az stream-analytics job create -n MineIoT-streamAnalyticsJob -g default-iot-project --transformation name="transformationSAJ" streaming-units=1

            $SAJ_input_name = "input-IoTHub"
            $SAJ_input_properties = '{\"type\":\"Stream\",\"datasource\":{\"type\":\"Microsoft.Devices/IotHubs\",\"properties\":{\"consumerGroupName\":\"$Default\",\"endpoint\":\"messages/events\",\"iotHubNamespace\":\"' + $iot_hub_name + '\",\"sharedAccessPolicyKey\":\"'+ $iot_hub_policy_key + '\",\"sharedAccessPolicyName\":\"' + $iot_hub_policy_name + '\"}},\"serialization\":{\"type\":\"Json\",\"properties\":{\"encoding\":\"UTF8\"}}}'
            Write-Host "Creating input for Stram Analytics Job "$stream_analytics_job_name": " $SAJ_input_name
            az stream-analytics input create -n $SAJ_input_name --job-name $stream_analytics_job_name -g $resource_group_name --properties $SAJ_input_properties 
            #az stream-analytics input create -n input-IoTHub --job-name MineIoT-streamAnalyticsJob -g default-iot-project --properties $SAJ_input_properties

            $SAJ_output_name = "output-CosmosDB"
            $SAJ_output_datasource = '{\"type\":\"Microsoft.Storage/DocumentDB\",\"properties\":{\"accountId\":\"' + $cosmosDB_account_name + '\",\"accountKey\":\"' + $cosmosDB_primary_key + '\",\"collectionNamePattern\":\"' + $cosmosDB_container_name + '\",\"database\":\"' + $cosmosDB_database_name + '\"}}'
            Write-Host "Creating output for Stram Analytics Job "$stream_analytics_job_name": " $SAJ_output_name
            az stream-analytics output create -n $SAJ_output_name --job-name $stream_analytics_job_name -g $resource_group_name --datasource $SAJ_output_datasource
            #az stream-analytics input create -n output-CosmosDB --job-name MineIoT-streamAnalyticsJob -g default-iot-project


            # ------ SQL server and database ------------------------------------------------------------------------
            $SQL_server_name = "mineiot-sql-server"
            $admin_user = "mineiot"
            $admin_password = "SQL123server"
            az sql server create --name $SQL_server_name --resource-group $resource_group_name  --admin-user $login --admin-password $password
            az sql server firewall-rule create --resource-group $resource_group_name --server $SQL_server_name -n "azure-resources" --start-ip-address "0.0.0.0" --end-ip-address "0.0.0.0"
            $SQL_database_name = "MineIoT-ChartDB"
            az sql db create --resource-group $resource_group_name --server $SQL_server_name --name $SQL_database_name --compute-model Serverless

        }
        "3"{
            $resource_group_name = "default-iot-project"
            az group delete -n $resource_group_name

        }
        default{
            Write-Host "Opzione non presente!"
        }
    }
}

pause
