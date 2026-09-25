#!/usr/bin/env python3
"""
EarthScape Hadoop MapReduce - Rainfall Reducer
"""
import sys

current_key = None
rain_sum = 0.0
count = 0

for line in sys.stdin:
    line = line.strip()
    if not line:
        continue
    try:
        key, val_str = line.split('\t', 1)
        rain_str, cnt_str = val_str.split(',')
        rain = float(rain_str)
        cnt = int(cnt_str)
    except ValueError:
        continue

    if current_key == key:
        rain_sum += rain
        count += cnt
    else:
        if current_key:
            avg_rain = rain_sum / count if count > 0 else 0
            loc, month = current_key.split('#')
            print(f"{loc}\tMonth={month},TotalRain={rain_sum:.2f},AvgRain={avg_rain:.2f},Records={count}")
        current_key = key
        rain_sum = rain
        count = cnt

if current_key and count > 0:
    avg_rain = rain_sum / count
    loc, month = current_key.split('#')
    print(f"{loc}\tMonth={month},TotalRain={rain_sum:.2f},AvgRain={avg_rain:.2f},Records={count}")
