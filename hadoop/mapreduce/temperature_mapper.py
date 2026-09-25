#!/usr/bin/env python3
"""
EarthScape Hadoop MapReduce - Temperature Mapper
Input: CSV standard climate data line
Output: location\ttemperature,1
"""
import sys

for line in sys.stdin:
    line = line.strip()
    if not line or line.startswith('date,'):
        continue
    parts = line.split(',')
    if len(parts) >= 6:
        location = parts[1].strip()
        try:
            temp = float(parts[4])
            print(f"{location}\t{temp},1")
        except ValueError:
            continue
