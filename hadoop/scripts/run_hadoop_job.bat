@echo off
echo =======================================================
echo  EarthScape Climate Agency - Hadoop MapReduce Job Runner
echo =======================================================
set HADOOP_HOME=C:\hadoop
set HADOOP_STREAMING_JAR=%HADOOP_HOME%\share\hadoop\tools\lib\hadoop-streaming-*.jar

echo [1/3] Preparing HDFS Input and Output paths...
%HADOOP_HOME%\bin\hdfs dfs -mkdir -p /earthscape/raw/weather
%HADOOP_HOME%\bin\hdfs dfs -put -f ../../data/sample/normal_data.csv /earthscape/raw/weather/

echo [2/3] Submitting Python Hadoop Streaming MapReduce Job...
%HADOOP_HOME%\bin\hadoop jar %HADOOP_STREAMING_JAR% ^
  -files ../mapreduce/temperature_mapper.py,../mapreduce/temperature_reducer.py ^
  -mapper "python temperature_mapper.py" ^
  -reducer "python temperature_reducer.py" ^
  -input /earthscape/raw/weather/normal_data.csv ^
  -output /earthscape/processed/temperature/output_%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%

echo [3/3] MapReduce Job Completed Successfully.