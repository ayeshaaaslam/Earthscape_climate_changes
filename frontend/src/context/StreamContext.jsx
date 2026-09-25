import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { simulationService } from '../services/api';

const StreamContext = createContext(null);

export const StreamProvider = ({ children }) => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [packets, setPackets] = useState([]);
  const [latestPacket, setLatestPacket] = useState(null);
  const [activeAlertsCount, setActiveAlertsCount] = useState(0);
  const eventSourceRef = useRef(null);

  const connectStream = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    try {
      const es = new EventSource(simulationService.getStreamUrl());
      eventSourceRef.current = es;

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

              // Check if any packet had alerts
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
        // SSE disconnected or backend restarting
        setIsStreaming(false);
      };
    } catch (e) {
      console.warn('[SSE Connection Failed]:', e);
    }
  };

  useEffect(() => {
    connectStream();
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const toggleStream = async () => {
    try {
      if (isStreaming) {
        await simulationService.stop();
        setIsStreaming(false);
      } else {
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