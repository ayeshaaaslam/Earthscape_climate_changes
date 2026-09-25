#!/bin/bash
echo "======================================================="
echo " EarthScape Climate Agency - Hadoop MapReduce Job Runner"
echo "======================================================="

HADOOP_STREAMING_JAR="$HADOOP_HOME/share/hadoop/tools/lib/hadoop-streaming-*.jar"

echo "[1/3] Creating HDFS Directory Hierarchy..."
hdfs dfs -mkdir -p /earthscape/raw/weather
hdfs dfs -mkdir -p /earthscape/processed/temperature
hdfs dfs -mkdir -p /earthscape/processed/rainfall
hdfs dfs -mkdir -p /earthscape/processed/co2
hdfs dfs -mkdir -p /earthscape/processed/anomalies

echo "[2/3] Uploading Raw Climate Records to HDFS..."
hdfs dfs -put -f ../../data/sample/normal_data.csv /earthscape/raw/weather/

echo "[3/3] Running Python MapReduce Job via Hadoop Streaming..."
hadoop jar $HADOOP_STREAMING_JAR \
  -files ../mapreduce/temperature_mapper.py,../mapreduce/temperature_reducer.py \
  -mapper "python3 temperature_mapper.py" \
  -reducer "python3 temperature_reducer.py" \
  -input /earthscape/raw/weather/normal_data.csv \
  -output /earthscape/processed/temperature/output_$(date +%s)

echo "Hadoop MapReduce execution completed."