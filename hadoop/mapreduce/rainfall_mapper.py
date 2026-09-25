#!/usr/bin/env python3
"""
EarthScape Hadoop MapReduce - Rainfall Mapper
"""
import sys

for line in sys.stdin:
    line = line.strip()
    if not line or line.startswith('date,'):
        continue
    parts = line.split(',')
    if len(parts) >= 7:
        date_str = parts[0].strip()
        location = parts[1].strip()
        month = date_str[:7] if len(date_str) >= 7 else "Unknown"
        key = f"{location}#{month}"
        try:
            rainfall = float(parts[6])
            print(f"{key}\t{rainfall},1")
        except ValueError:
            continue
