import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { simulationService } from '../services/api';

const StreamContext = createContext(null);

const LOCATIONS = [
  'Karachi Coastal Station',
  'Lahore Urban Observatory',
  'Islamabad Foothills Lab',
  'Quetta Valley Station',
  'Peshawar North Sensor',
  'Gilgit Glacial Monitor',
  'Gwadar Deep-Sea Outpost'
];

export const StreamProvider = ({ children }) => {
  const [isStreaming, setIsStreaming] = useState(true);
  const [packets, setPackets] = useState([]);
  const [latestPacket, setLatestPacket] = useState(null);
  const [activeAlertsCount, setActiveAlertsCount] = useState(2);
  const eventSourceRef = useRef(null);
  const mockIntervalRef = useRef(null);

  // Generate simulated telemetry packet
  const generateMockPacket = () => {
    const loc = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
    const temp = parseFloat((22 + Math.random() * 18).toFixed(1));
    const hum = parseFloat((40 + Math.random() * 50).toFixed(1));
    const rain = parseFloat((Math.random() > 0.6 ? Math.random() * 15 : 0).toFixed(1));
    const co2 = parseFloat((400 + Math.random() * 35).toFixed(1));
    const wind = parseFloat((10 + Math.random() * 30).toFixed(1));
    const pressure = parseFloat((1010 + Math.random() * 8).toFixed(1));

    const alerts = [];
    if (temp > 42) alerts.push({ parameter: 'temperature', message: `High Temperature Alert: ${temp}°C at ${loc}` });
    if (rain > 20) alerts.push({ parameter: 'rainfall', message: `Heavy Rain Alert: ${rain}mm at ${loc}` });

    return {
      id: 'pkt_' + Date.now(),
      timestamp: new Date().toISOString(),
      location: loc,
      temperature: temp,
      humidity: hum,
      rainfall: rain,
      co2: co2,
      windSpeed: wind,
      airPressure: pressure,
      alerts
    };
  };

  const startMockStreaming = () => {
    if (mockIntervalRef.current) return;
    
    // Seed initial packets
    const initial = [];
    for (let i = 0; i < 8; i++) {
      initial.push(generateMockPacket());
    }
    setPackets(initial);
    setLatestPacket(initial[0]);

    mockIntervalRef.current = setInterval(() => {
      const newPkt = generateMockPacket();
      setLatestPacket(newPkt);
      setPackets((prev) => [newPkt, ...prev].slice(0, 100));
      if (newPkt.alerts && newPkt.alerts.length > 0) {
        setActiveAlertsCount((prev) => prev + 1);
      }
    }, 3000);
  };

  const connectStream = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    try {
      const es = new EventSource(simulationService.getStreamUrl());
      eventSourceRef.current = es;

      es.onopen = () => {
        if (mockIntervalRef.current) {
          clearInterval(mockIntervalRef.current);
          mockIntervalRef.current = null;
        }
      };

      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'CONNECTED') {
            setIsStreaming(data.isRunning);
            if (data.recent && data.recent.length > 0) {
              setPackets(data.recent);
              setLatestPacket(data.recent[0]);
            }
          } else if (data.type === 'TELEMETRY_BATCH') {
            if (data.packets && data.packets.length > 0) {
              setIsStreaming(true);
              setLatestPacket(data.packets[0]);
              setPackets((prev) => [...data.packets, ...prev].slice(0, 100));

              const hasAlert = data.packets.some(p => p.alerts && p.alerts.length > 0);
              if (hasAlert) {
                setActiveAlertsCount((prev) => prev + 1);
              }
            }
          }
        } catch (e) {
          console.error('[SSE Parse Error]:', e);
        }
      };

      es.onerror = () => {
        // SSE disconnected, activate standalone mock stream
        startMockStreaming();
      };
    } catch (e) {
      startMockStreaming();
    }
  };

  useEffect(() => {
    connectStream();
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (mockIntervalRef.current) {
        clearInterval(mockIntervalRef.current);
      }
    };
  }, []);

  const toggleStream = async () => {
    try {
      if (isStreaming) {
        if (mockIntervalRef.current) {
          clearInterval(mockIntervalRef.current);
          mockIntervalRef.current = null;
        }
        await simulationService.stop();
        setIsStreaming(false);
      } else {
        startMockStreaming();
        await simulationService.start(3);
        setIsStreaming(true);
      }
    } catch (err) {
      console.error('Failed to toggle stream:', err);
    }
  };

  return (
    <StreamContext.Provider value={{ isStreaming, packets, latestPacket, activeAlertsCount, toggleStream, reconnect: connectStream }}>
      {children}
    </StreamContext.Provider>
  );
};

export const useStream = () => useContext(StreamContext);