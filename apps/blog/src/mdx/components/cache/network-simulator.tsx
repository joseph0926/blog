'use client';

import { cn } from '@joseph0926/ui/lib/utils';
import { HardDriveDownload, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

export function NetworkSimulator() {
  const [refreshType, setRefreshType] = useState<'normal' | 'force'>('normal');
  const [requests, setRequests] = useState([
    { url: '/logo.png', status: 200, size: '3.2MB', cached: false },
    { url: '/style.css', status: 200, size: '45KB', cached: false },
    { url: '/script.js', status: 200, size: '128KB', cached: false },
  ]);

  const handleRefresh = (type: 'normal' | 'force') => {
    setRefreshType(type);
    setRequests((prev) =>
      prev.map((req) => ({
        ...req,
        status: type === 'normal' && req.cached ? 304 : 200,
        size: type === 'normal' && req.cached ? '0.2KB' : req.size,
        cached: true,
      })),
    );
  };

  return (
    <div className="bg-card my-6 rounded-lg border p-4">
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => handleRefresh('normal')}
          className="flex items-center gap-2 rounded-md bg-blue-500/10 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-500/20 dark:text-blue-400"
        >
          <RefreshCw className="h-4 w-4" />
          일반 새로고침 (F5)
        </button>
        <button
          onClick={() => handleRefresh('force')}
          className="flex items-center gap-2 rounded-md bg-orange-500/10 px-3 py-2 text-sm font-medium text-orange-600 hover:bg-orange-500/20 dark:text-orange-400"
        >
          <HardDriveDownload className="h-4 w-4" />
          강제 새로고침 (Ctrl+Shift+F5)
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-muted-foreground border-b text-left">
              <th className="pb-2 font-medium">URL</th>
              <th className="pb-2 font-medium">Status</th>
              <th className="pb-2 font-medium">Size</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req, idx) => (
              <motion.tr
                key={idx}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="border-b"
              >
                <td className="py-2">{req.url}</td>
                <td className="py-2">
                  <span
                    className={cn(
                      'inline-flex rounded-full px-2 py-1 text-xs font-semibold',
                      req.status === 304
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
                    )}
                  >
                    {req.status}
                  </span>
                </td>
                <td className="py-2">
                  <span
                    className={
                      req.status === 304 ? 'text-muted-foreground' : ''
                    }
                  >
                    {req.size}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bg-muted/50 text-muted-foreground mt-4 rounded-md p-3 text-xs">
        {refreshType === 'normal' ? (
          <p>
            <strong>304 Not Modified:</strong> 브라우저 캐시를 사용합니다. 실제
            데이터는 전송되지 않아 Size가 작습니다.
          </p>
        ) : (
          <p>
            <strong>200 OK:</strong> 서버에서 전체 데이터를 새로 받습니다.
            캐시를 무시하고 전체 파일을 다운로드합니다.
          </p>
        )}
      </div>
    </div>
  );
}
