#!/usr/bin/env python3
"""
EarthScape Hadoop MapReduce - Anomaly Mapper
"""
import sys

# Default thresholds
TEMP_MAX = 45.0
RAIN_MAX = 100.0
HUMID_MAX = 90.0
CO2_MAX = 450.0

for line in sys.stdin:
    line = line.strip()
    if not line or line.startswith('date,'):
        continue
    parts = line.split(',')
    if len(parts) >= 11:
        date = parts[0].strip()
        location = parts[1].strip()
        try:
            temp = float(parts[4])
            humid = float(parts[5])
            rain = float(parts[6])
            co2 = float(parts[9])

            if temp > TEMP_MAX:
                print(f"{location}\tANOMALY,Date={date},Param=Temperature,Value={temp},Threshold={TEMP_MAX}")
            if rain > RAIN_MAX:
                print(f"{location}\tANOMALY,Date={date},Param=Rainfall,Value={rain},Threshold={RAIN_MAX}")
            if humid > HUMID_MAX:
                print(f"{location}\tANOMALY,Date={date},Param=Humidity,Value={humid},Threshold={HUMID_MAX}")
            if co2 > CO2_MAX:
                print(f"{location}\tANOMALY,Date={date},Param=CO2,Value={co2},Threshold={CO2_MAX}")
        except ValueError:
            continue
