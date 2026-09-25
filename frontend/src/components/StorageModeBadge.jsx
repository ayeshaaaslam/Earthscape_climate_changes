import React from 'react';
import { Database, Server } from 'lucide-react';

const StorageModeBadge = ({ mode = 'LOCAL' }) => {
  const isHdfs = mode === 'HDFS';

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${
      isHdfs
        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
        : 'bg-cyan-50 border-cyan-200 text-cyan-800'
    }`}>
      {isHdfs ? <Server className="h-3.5 w-3.5 text-emerald-600" /> : <Database className="h-3.5 w-3.5 text-cyan-600" />}
      <span>{isHdfs ? 'HDFS MODE' : 'LOCAL DEV MODE'}</span>
    </div>
  );
};

export default StorageModeBadge;