#!/usr/bin/env python3
"""
EarthScape Hadoop MapReduce - Temperature Reducer
Input: location\ttemperature,1
Output: location\tAverageTemp,MinTemp,MaxTemp,Count
"""
import sys

current_location = None
temp_sum = 0.0
temp_min = float('inf')
temp_max = float('-inf')
count = 0

for line in sys.stdin:
    line = line.strip()
    if not line:
        continue
    try:
        location, val_str = line.split('\t', 1)
        temp_str, cnt_str = val_str.split(',')
        temp = float(temp_str)
        cnt = int(cnt_str)
    except ValueError:
        continue

    if current_location == location:
        temp_sum += temp
        count += cnt
        if temp < temp_min:
            temp_min = temp
        if temp > temp_max:
            temp_max = temp
    else:
        if current_location:
            avg_temp = temp_sum / count if count > 0 else 0
            print(f"{current_location}\tAvg={avg_temp:.2f},Min={temp_min:.2f},Max={temp_max:.2f},Count={count}")
        current_location = location
        temp_sum = temp
        temp_min = temp
        temp_max = temp
        count = cnt

if current_location and count > 0:
    avg_temp = temp_sum / count
    print(f"{current_location}\tAvg={avg_temp:.2f},Min={temp_min:.2f},Max={temp_max:.2f},Count={count}")
