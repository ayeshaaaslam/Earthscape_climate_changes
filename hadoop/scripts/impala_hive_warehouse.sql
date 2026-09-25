-- ==============================================================================
-- EarthScape Climate Agency - Apache Impala & Hive Big Data Warehouse DDL & Queries
-- Storage: Hadoop Distributed File System (HDFS) / Parquet Columnar Format
-- Execution Engine: Apache Impala / Apache Hive on MapReduce / Tez
-- ==============================================================================

-- 1. Create Climate Analytics Database
CREATE DATABASE IF NOT EXISTS earthscape_climate_db
COMMENT 'Enterprise Big Data Climate Analytics Data Warehouse for EarthScape Agency'
LOCATION '/earthscape/warehouse/earthscape_climate_db.db';

USE earthscape_climate_db;

-- 2. External Staging Table mapping directly to raw HDFS CSV files
DROP TABLE IF EXISTS raw_climate_staging;
CREATE EXTERNAL TABLE raw_climate_staging (
    record_date STRING,
    location STRING,
    latitude DOUBLE,
    longitude DOUBLE,
    temperature DOUBLE,
    humidity DOUBLE,
    rainfall DOUBLE,
    wind_speed DOUBLE,
    air_pressure DOUBLE,
    co2 DOUBLE,
    source STRING
)
ROW FORMAT DELIMITED
FIELDS TERMINATED BY ','
STORED AS TEXTFILE
LOCATION '/earthscape/raw/weather/'
TBLPROPERTIES ("skip.header.line.count"="1");

-- 3. Optimized Production Table: Partitioned by Location and Stored as PARQUET
DROP TABLE IF EXISTS fact_climate_records;
CREATE TABLE fact_climate_records (
    record_date TIMESTAMP,
    latitude DOUBLE,
    longitude DOUBLE,
    temperature FLOAT,
    humidity FLOAT,
    rainfall FLOAT,
    wind_speed FLOAT,
    air_pressure FLOAT,
    co2 FLOAT,
    source STRING,
    year INT,
    month INT
)
PARTITIONED BY (location STRING)
STORED AS PARQUET
TBLPROPERTIES ("parquet.compression"="SNAPPY");

-- 4. Ingest & Transform from Raw CSV into Parquet Partitions
INSERT OVERWRITE TABLE fact_climate_records PARTITION (location)
SELECT 
    CAST(record_date AS TIMESTAMP) AS record_date,
    latitude,
    longitude,
    CAST(temperature AS FLOAT) AS temperature,
    CAST(humidity AS FLOAT) AS humidity,
    CAST(rainfall AS FLOAT) AS rainfall,
    CAST(wind_speed AS FLOAT) AS wind_speed,
    CAST(air_pressure AS FLOAT) AS air_pressure,
    CAST(co2 AS FLOAT) AS co2,
    source,
    YEAR(CAST(record_date AS TIMESTAMP)) AS year,
    MONTH(CAST(record_date AS TIMESTAMP)) AS month,
    location
FROM raw_climate_staging
WHERE location IS NOT NULL AND record_date != 'date';

-- Refresh Impala Metadata Cache
REFRESH fact_climate_records;

-- ==============================================================================
-- 5. Analytical Big Data Queries for Climate Patterns & Anomalies
-- ==============================================================================

-- QUERY 1: Long-term Temperature Anomalies & Statistical Deviations
SELECT 
    location,
    YEAR(record_date) AS observation_year,
    COUNT(*) AS record_count,
    ROUND(AVG(temperature), 2) AS mean_temperature,
    ROUND(MIN(temperature), 2) AS min_temperature,
    ROUND(MAX(temperature), 2) AS max_temperature,
    ROUND(STDDEV(temperature), 2) AS temp_volatility
FROM fact_climate_records
GROUP BY location, YEAR(record_date)
ORDER BY observation_year DESC, mean_temperature DESC;

-- QUERY 2: High Severity Climate Outliers (Extreme Heatwaves & Torrential Floods)
SELECT 
    record_date,
    location,
    temperature,
    rainfall,
    humidity,
    co2,
    CASE 
        WHEN temperature > 45.0 THEN 'CRITICAL HEATWAVE'
        WHEN rainfall > 100.0 THEN 'FLASH FLOOD EMERGENCY'
        WHEN co2 > 450.0 THEN 'HAZARDOUS EMISSIONS'
        ELSE 'ELEVATED ANOMALY'
    END AS anomaly_classification
FROM fact_climate_records
WHERE temperature > 45.0 
   OR rainfall > 100.0 
   OR co2 > 450.0
ORDER BY record_date DESC;

-- QUERY 3: Regional Climate Trend Moving Average (Window Function)
SELECT 
    location,
    record_date,
    temperature,
    ROUND(AVG(temperature) OVER (
        PARTITION BY location 
        ORDER BY record_date 
        ROWS BETWEEN 30 PRECEDING AND CURRENT ROW
    ), 2) AS rolling_30day_avg_temp,
    rainfall,
    ROUND(SUM(rainfall) OVER (
        PARTITION BY location 
        ORDER BY record_date 
        ROWS BETWEEN 30 PRECEDING AND CURRENT ROW
    ), 2) AS rolling_30day_total_rain
FROM fact_climate_records
ORDER BY location, record_date DESC;

-- QUERY 4: Carbon Dioxide vs Ambient Temperature Correlation Summary
SELECT 
    location,
    ROUND(CORR(temperature, co2), 4) AS pearson_temp_co2_corr,
    ROUND(CORR(temperature, humidity), 4) AS pearson_temp_humidity_corr,
    ROUND(CORR(rainfall, humidity), 4) AS pearson_rain_humidity_corr
FROM fact_climate_records
GROUP BY location;
