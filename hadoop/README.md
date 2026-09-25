# EarthScape Big Data Engine: Hadoop & MapReduce

## 1. Overview
The **EarthScape Climate Agency** Big Data subsystem utilizes Apache Hadoop, HDFS distributed storage, and Hadoop Streaming MapReduce jobs to process high-volume climate records across weather stations.

## 2. HDFS Directory Hierarchy
```text
/earthscape
    /raw
        /weather        # Station observations (.csv / .json)
        /satellite      # Satellite raster / metadata
        /sensors        # IoT sensor telemetry
    /processed
        /temperature    # Temperature Min/Max/Avg aggregates
        /rainfall       # Monthly precipitation matrices
        /humidity       # Atmospheric moisture levels
        /co2            # Carbon concentration profiles
        /anomalies      # Filtered extreme outlier records
    /ml
        /training       # Preprocessed training features
        /predictions    # Projected climate trend outputs
    /reports            # Generated analysis summaries
```

## 3. MapReduce Architecture & Algorithms
- **Temperature Mapper & Reducer** (`temperature_mapper.py`, `temperature_reducer.py`): Parses raw records, emits `(location, [temp, 1])`, shuffles/sorts by key, and reduces into average, minimum, and maximum temperatures per station.
- **Rainfall Mapper & Reducer** (`rainfall_mapper.py`, `rainfall_reducer.py`): Groups by `location#YYYY-MM` to compute monthly rainfall totals and mean precipitation.
- **CO2 & Humidity Matrix**: Calculates spatial carbon distributions.
- **Anomaly Detection Mapper & Reducer**: Scans records exceeding configured thresholds and partitions outlier events.

## 4. Dual-Mode Architecture
- **HDFS Mode**: Interacts directly with Hadoop WebHDFS REST API and Hadoop Streaming cluster.
- **Local Dev Mode**: Employs an exact-semantics in-process MapReduce engine matching mapper/reducer input-splits and partition sorting without requiring a multi-node cluster.