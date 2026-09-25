#!/usr/bin/env python3
"""
EarthScape Hadoop MapReduce - Anomaly Reducer
"""
import sys

current_location = None
anomaly_list = []

for line in sys.stdin:
    line = line.strip()
    if not line:
        continue
    try:
        location, details = line.split('\t', 1)
    except ValueError:
        continue

    if current_location == location:
        anomaly_list.append(details)
    else:
        if current_location:
            print(f"{current_location}\tTotalAnomalies={len(anomaly_list)},Details={' | '.join(anomaly_list)}")
        current_location = location
        anomaly_list = [details]

if current_location:
    print(f"{current_location}\tTotalAnomalies={len(anomaly_list)},Details={' | '.join(anomaly_list)}")
