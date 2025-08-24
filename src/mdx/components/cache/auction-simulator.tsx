'use client';

import { Clock, TrendingUp, Users } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export function AuctionSimulator() {
  const [currentBid, setCurrentBid] = useState(100000);
  const [bidHistory, setBidHistory] = useState<
    Array<{ time: string; amount: number }>
  >([]);
  const [cacheStrategy, setCacheStrategy] = useState<'none' | 'short' | 'long'>(
    'none',
  );
  const [displayedBid, setDisplayedBid] = useState(100000);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      const increment = Math.floor(Math.random() * 50000) + 10000;
      setCurrentBid((prev) => prev + increment);

      setBidHistory((prev) => [
        {
          time: new Date().toLocaleTimeString(),
          amount: currentBid + increment,
        },
        ...prev.slice(0, 4),
      ]);

      if (cacheStrategy === 'none') {
        setDisplayedBid(currentBid + increment);
      } else if (cacheStrategy === 'short') {
        setTimeout(() => setDisplayedBid(currentBid + increment), 3000);
      } else {
        setTimeout(() => setDisplayedBid(currentBid + increment), 10000);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isRunning, currentBid, cacheStrategy]);

  return (
    <div className="bg-card my-8 rounded-lg border p-6">
      <div className="mb-6">
        <h4 className="mb-2 text-lg font-semibold">실시간 경매 시뮬레이터</h4>
        <p className="text-muted-foreground text-sm">
          캐싱 전략에 따라 사용자가 보는 가격이 어떻게 달라지는지 확인해보세요
        </p>
      </div>
      <div className="mb-6 flex flex-wrap gap-2">
        {[
          { value: 'none' as const, label: '캐싱 없음', color: 'red' },
          { value: 'short' as const, label: '3초 캐싱', color: 'yellow' },
          { value: 'long' as const, label: '10초 캐싱', color: 'green' },
        ].map((option) => (
          <button
            key={option.value}
            onClick={() => setCacheStrategy(option.value)}
            className={cn(
              'rounded-md px-4 py-2 text-sm font-medium transition-all',
              cacheStrategy === option.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80',
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="text-muted-foreground mb-2 flex items-center gap-2 text-sm">
            <TrendingUp className="h-4 w-4" />
            실제 입찰가
          </div>
          <div className="text-2xl font-bold">
            ₩{currentBid.toLocaleString()}
          </div>
        </div>
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="text-muted-foreground mb-2 flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4" />
            사용자가 보는 가격
          </div>
          <div className="text-2xl font-bold">
            ₩{displayedBid.toLocaleString()}
          </div>
          {displayedBid !== currentBid && (
            <div className="mt-1 text-xs text-orange-500">
              {Math.abs(currentBid - displayedBid).toLocaleString()}원 차이
            </div>
          )}
        </div>
      </div>
      <div className="mt-6">
        <div className="text-muted-foreground mb-2 flex items-center gap-2 text-sm">
          <Users className="h-4 w-4" />
          최근 입찰 내역
        </div>
        <div className="space-y-1">
          {bidHistory.map((bid, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-muted/30 flex justify-between rounded px-3 py-2 text-sm"
            >
              <span className="text-muted-foreground">{bid.time}</span>
              <span className="font-medium">
                ₩{bid.amount.toLocaleString()}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
      <button
        onClick={() => setIsRunning(!isRunning)}
        className="bg-primary text-primary-foreground hover:bg-primary/90 mt-6 w-full rounded-md px-4 py-2 text-sm font-medium"
      >
        {isRunning ? '경매 중지' : '경매 시작'}
      </button>
    </div>
  );
}
