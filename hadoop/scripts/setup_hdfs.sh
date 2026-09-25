#!/bin/bash
# HDFS Directory Initialization Script
hdfs dfs -mkdir -p /earthscape/raw/weather
hdfs dfs -mkdir -p /earthscape/raw/satellite
hdfs dfs -mkdir -p /earthscape/raw/sensors
hdfs dfs -mkdir -p /earthscape/processed/temperature
hdfs dfs -mkdir -p /earthscape/processed/rainfall
hdfs dfs -mkdir -p /earthscape/processed/humidity
hdfs dfs -mkdir -p /earthscape/processed/co2
hdfs dfs -mkdir -p /earthscape/processed/anomalies
hdfs dfs -mkdir -p /earthscape/ml/training
hdfs dfs -mkdir -p /earthscape/ml/predictions
hdfs dfs -mkdir -p /earthscape/reports
echo "All EarthScape HDFS partitions created."