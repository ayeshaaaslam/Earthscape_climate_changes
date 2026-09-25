@echo off
REM ============================================================================
REM EarthScape Climate Agency - HDFS Cluster Setup & Directory Ingestion Script
REM ============================================================================

echo Initializing EarthScape HDFS Data Directory Structure...

REM 1. Create HDFS directories
hdfs dfs -mkdir -p /earthscape/raw/weather
hdfs dfs -mkdir -p /earthscape/raw/satellite
hdfs dfs -mkdir -p /earthscape/raw/sensors
hdfs dfs -mkdir -p /earthscape/processed/temperature
hdfs dfs -mkdir -p /earthscape/processed/rainfall
hdfs dfs -mkdir -p /earthscape/processed/anomalies
hdfs dfs -mkdir -p /earthscape/warehouse

REM 2. Upload sample climate datasets to HDFS
echo Uploading climate datasets to HDFS...
hdfs dfs -put -f ..\..\data\sample\normal_data.csv /earthscape/raw/weather/
hdfs dfs -put -f ..\..\data\sample\anomaly_data.csv /earthscape/raw/weather/

REM 3. Verify HDFS storage contents
echo HDFS Storage Contents:
hdfs dfs -ls -R /earthscape

echo ============================================================================
echo EarthScape HDFS initialization complete!
echo ============================================================================
pause
