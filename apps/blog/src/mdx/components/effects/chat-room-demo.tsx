'use client';

import { Button } from '@joseph0926/ui/components/button';
import { Card } from '@joseph0926/ui/components/card';
import { cn } from '@joseph0926/ui/lib/utils';
import { useEffect, useState, useSyncExternalStore } from 'react';

type Locale = 'ko' | 'en';
type Theme = 'light' | 'dark';
// Parameter names in these function types document the message API.
// eslint-disable-next-line no-unused-vars
type MessageListener = (message: string) => void;
// eslint-disable-next-line no-unused-vars
type Subscribe = (roomId: string, listener: MessageListener) => () => void;
type ReceivedMessage = { message: string; theme: Theme };

const COPY = {
  ko: {
    title: 'theme를 추가하면 무엇이 달라질까요?',
    description:
      '테마를 바꾸고 메시지를 도착시켜 보세요. 메시지를 처리할 때 읽은 테마와 room 재연결 횟수를 비교할 수 있습니다.',
    currentTheme: '현재 테마',
    currentRoom: '현재 room',
    light: '밝음',
    dark: '어두움',
    toDark: '어두운 테마로 바꾸기',
    toLight: '밝은 테마로 바꾸기',
    receive: '메시지 도착시키기',
    resubscribe: '2. theme 추가: [roomId, theme]',
    resubscribeDetail: '새 테마를 읽지만 room도 다시 연결됩니다.',
    stale: '1. theme 없음: [roomId]',
    staleDetail: 'room 연결은 유지되지만 처음 테마를 읽습니다.',
    empty: '아직 도착한 메시지가 없습니다.',
    readTheme: '메시지 처리 때 읽은 테마',
    reconnects: '테마 변경 후 room 재연결 횟수',
    message: '안녕하세요!',
    simulation:
      '실제 서버 대신 버튼으로 같은 메시지를 두 예제에 전달합니다. 초기 연결은 세지 않고, 첫 테마 변경 이후 실제로 구독을 다시 등록한 횟수를 표시합니다.',
  },
  en: {
    title: 'What changes when theme is added?',
    description:
      'Change the theme and deliver a message. Compare the theme read when handling the message and the number of room reconnections.',
    currentTheme: 'Current theme',
    currentRoom: 'Current room',
    light: 'Light',
    dark: 'Dark',
    toDark: 'Switch to dark theme',
    toLight: 'Switch to light theme',
    receive: 'Deliver a message',
    resubscribe: '2. With theme: [roomId, theme]',
    resubscribeDetail: 'Reads the new theme but also reconnects the room.',
    stale: '1. Without theme: [roomId]',
    staleDetail: 'Keeps the room connection but reads the original theme.',
    empty: 'No messages have arrived yet.',
    readTheme: 'Theme read when handling the message',
    reconnects: 'Room reconnections after changing the theme',
    message: 'Hello!',
    simulation:
      'The button delivers the same message to both examples in place of a real server. The count excludes initial connections and records actual subscription registrations after the first theme change.',
  },
};

type Copy = (typeof COPY)[Locale];

function createMessageSource() {
  const rooms = new Map<string, Set<MessageListener>>();
  const observers = new Set<() => void>();
  let counting = false;
  let reconnects = 0;

  const subscribe: Subscribe = (roomId, listener) => {
    let listeners = rooms.get(roomId);
    if (!listeners) {
      listeners = new Set();
      rooms.set(roomId, listeners);
    }
    listeners.add(listener);
    if (counting) {
      reconnects += 1;
      observers.forEach((observer) => observer());
    }

    return () => {
      listeners.delete(listener);
      if (listeners.size === 0) rooms.delete(roomId);
    };
  };

  return {
    subscribe,
    startCounting() {
      // Initial setup, including StrictMode's extra setup, precedes measurement.
      counting = true;
    },
    observe(observer: () => void) {
      observers.add(observer);
      return () => observers.delete(observer);
    },
    getReconnectCount: () => reconnects,
    getServerSnapshot: () => 0,
    deliver(roomId: string, message: string) {
      rooms.get(roomId)?.forEach((listener) => listener(message));
    },
  };
}

type MessageSource = ReturnType<typeof createMessageSource>;

function MessagePanel({
  title,
  description,
  received,
  source,
  copy,
}: {
  title: string;
  description: string;
  received: ReceivedMessage | null;
  source: MessageSource;
  copy: Copy;
}) {
  const reconnects = useSyncExternalStore(
    source.observe,
    source.getReconnectCount,
    source.getServerSnapshot,
  );

  return (
    <section aria-label={title} className="border-border rounded-xl border p-4">
      <h4 className="m-0 text-sm font-semibold">{title}</h4>
      <p className="text-muted-foreground mt-2 mb-4 text-xs leading-5">
        {description}
      </p>
      <p className="m-0 mb-4 text-xs leading-5">
        {copy.reconnects}:{' '}
        <output aria-label={copy.reconnects} className="font-semibold">
          {reconnects}
        </output>
      </p>
      {received ? (
        <div
          className={cn(
            'rounded-lg border p-4',
            received.theme === 'dark'
              ? 'border-slate-700 bg-slate-950 text-slate-50'
              : 'border-slate-200 bg-slate-50 text-slate-950',
          )}
        >
          <p className="m-0 text-base">{received.message}</p>
          <p className="mt-3 mb-0 text-xs">
            {copy.readTheme}:{' '}
            <output aria-label={copy.readTheme} className="font-semibold">
              {copy[received.theme]}
            </output>
          </p>
        </div>
      ) : (
        <p className="text-muted-foreground border-border m-0 rounded-lg border border-dashed p-4 text-sm">
          {copy.empty}
        </p>
      )}
    </section>
  );
}

type ChatRoomProps = {
  roomId: string;
  theme: Theme;
  source: MessageSource;
  copy: Copy;
};

function ResubscribingChatRoom({ roomId, theme, source, copy }: ChatRoomProps) {
  const [received, setReceived] = useState<ReceivedMessage | null>(null);
  const { subscribe } = source;

  useEffect(() => {
    return subscribe(roomId, (message) => {
      setReceived({ message, theme });
    });
  }, [roomId, theme, subscribe]);

  return (
    <MessagePanel
      title={copy.resubscribe}
      description={copy.resubscribeDetail}
      received={received}
      source={source}
      copy={copy}
    />
  );
}

function StaleChatRoom({ roomId, theme, source, copy }: ChatRoomProps) {
  const [received, setReceived] = useState<ReceivedMessage | null>(null);
  const { subscribe } = source;

  useEffect(() => {
    return subscribe(roomId, (message) => {
      setReceived({ message, theme });
    });
    // The missing theme dependency intentionally preserves the old callback for this demo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, subscribe]);

  return (
    <MessagePanel
      title={copy.stale}
      description={copy.staleDetail}
      received={received}
      source={source}
      copy={copy}
    />
  );
}

export function EffectChatRoomDemo({ locale = 'ko' }: { locale?: Locale }) {
  const copy = COPY[locale];
  const [theme, setTheme] = useState<Theme>('light');
  const [sources] = useState(() => ({
    stale: createMessageSource(),
    resubscribing: createMessageSource(),
  }));
  const roomId = 'general';

  return (
    <Card
      className="not-prose border-border/70 bg-card my-8 gap-5 p-4 sm:p-6"
      data-testid="effect-chatroom-demo"
    >
      <div>
        <h3 className="m-0 text-lg font-semibold">{copy.title}</h3>
        <p className="text-muted-foreground mt-2 mb-0 text-sm leading-6">
          {copy.description}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <p className="m-0 text-sm">
          {copy.currentRoom}:{' '}
          <output aria-label={copy.currentRoom} className="font-semibold">
            {roomId}
          </output>
        </p>
        <p className="m-0 text-sm">
          {copy.currentTheme}: <strong>{copy[theme]}</strong>
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            sources.stale.startCounting();
            sources.resubscribing.startCounting();
            setTheme(theme === 'light' ? 'dark' : 'light');
          }}
        >
          {theme === 'light' ? copy.toDark : copy.toLight}
        </Button>
        <Button
          size="sm"
          onClick={() => {
            sources.stale.deliver(roomId, copy.message);
            sources.resubscribing.deliver(roomId, copy.message);
          }}
        >
          {copy.receive}
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <StaleChatRoom
          roomId={roomId}
          theme={theme}
          source={sources.stale}
          copy={copy}
        />
        <ResubscribingChatRoom
          roomId={roomId}
          theme={theme}
          source={sources.resubscribing}
          copy={copy}
        />
      </div>
      <p className="text-muted-foreground m-0 text-xs leading-5">
        {copy.simulation}
      </p>
    </Card>
  );
}
