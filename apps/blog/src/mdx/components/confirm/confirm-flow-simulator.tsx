'use client';

import { cn } from '@joseph0926/ui/lib/utils';
import {
  Check,
  CircleDashed,
  Clock3,
  CornerDownRight,
  Play,
  RotateCcw,
  Search,
  X,
} from 'lucide-react';
import { type ReactNode, useMemo, useRef, useState } from 'react';

type Mode = 'naive' | 'returnOnly' | 'pendingIntent' | 'promise';
type PromiseStatus = 'idle' | 'pending' | 'resolvedTrue' | 'resolvedFalse';
type Locale = 'ko' | 'en';

type LogEntry = {
  id: number;
  tone: 'neutral' | 'info' | 'success' | 'warning' | 'danger';
  message: string;
};

type Copy = {
  title: string;
  description: string;
  modesLabel: string;
  request: string;
  cancel: string;
  confirm: string;
  reset: string;
  dialogTitle: string;
  dialogDescription: string;
  noDialog: string;
  state: string;
  log: string;
  actionCount: string;
  dialogOpen: string;
  pendingIntent: string;
  promise: string;
  empty: string;
  stored: string;
  open: string;
  closed: string;
  idle: string;
  pending: string;
  resolvedTrue: string;
  resolvedFalse: string;
  ran: string;
  notYet: string;
  statusHint: string;
  modes: Record<Mode, { label: string; description: string; short: string }>;
  logs: Record<
    | 'reset'
    | 'request'
    | 'open'
    | 'naiveRun'
    | 'returnOnlyStop'
    | 'pendingStored'
    | 'promisePending'
    | 'cancelAfterRun'
    | 'cancelClosed'
    | 'cancelDrop'
    | 'promiseFalse'
    | 'confirmAlreadyRan'
    | 'confirmNoIntent'
    | 'confirmPending'
    | 'promiseTrue',
    string
  >;
};

const COPY: Record<Locale, Copy> = {
  ko: {
    title: 'Confirm Flow Simulator',
    description:
      '같은 요청을 네 가지 방식으로 실행해보며 무엇이 먼저 실행되고, 무엇이 남는지 확인합니다.',
    modesLabel: '흐름 선택',
    request: 'Request action',
    cancel: 'Cancel',
    confirm: 'Confirm',
    reset: 'Reset',
    dialogTitle: 'Unsaved changes',
    dialogDescription: '이 action을 계속 실행할까요?',
    noDialog: 'Dialog가 열려 있지 않습니다.',
    state: 'State',
    log: 'Event log',
    actionCount: 'Action ran',
    dialogOpen: 'Dialog open',
    pendingIntent: 'Pending intent',
    promise: 'Promise',
    empty: 'empty',
    stored: 'stored',
    open: 'open',
    closed: 'closed',
    idle: 'idle',
    pending: 'pending',
    resolvedTrue: 'resolved true',
    resolvedFalse: 'resolved false',
    ran: 'ran',
    notYet: 'not yet',
    statusHint:
      '핵심은 Dialog가 열렸는지가 아니라, 이어서 실행할 의도가 남아 있는지입니다.',
    modes: {
      naive: {
        label: 'Naive',
        short: 'open + run',
        description: 'Dialog를 열고 같은 handler에서 action까지 실행합니다.',
      },
      returnOnly: {
        label: 'Return only',
        short: 'open + return',
        description:
          '즉시 실행은 막지만 confirm 후 이어갈 일을 저장하지 않습니다.',
      },
      pendingIntent: {
        label: 'Pending intent',
        short: 'store + commit',
        description: '확인 후 실행할 intent를 저장하고 confirm에서 실행합니다.',
      },
      promise: {
        label: 'Promise',
        short: 'resolve + continue',
        description: '사용자 선택을 Promise 결과로 호출자에게 돌려줍니다.',
      },
    },
    logs: {
      reset: 'reset: 상태를 초기화했습니다.',
      request: 'request: 사용자가 action을 요청했습니다.',
      open: 'setIsConfirmOpen(true): Dialog 표시를 예약했습니다.',
      naiveRun: 'submit(): Dialog 응답을 기다리지 않고 action이 실행됐습니다.',
      returnOnlyStop:
        'return: 현재 handler는 끝났지만 이어갈 일은 남지 않았습니다.',
      pendingStored:
        'pendingIntent = submit: confirm 때 실행할 일을 저장했습니다.',
      promisePending:
        'confirm(): Promise를 pending 상태로 만들고 Dialog를 열었습니다.',
      cancelAfterRun:
        'cancel: Dialog는 닫혔지만 action은 이미 실행된 뒤입니다.',
      cancelClosed: 'cancel: 저장된 일이 없어 Dialog만 닫았습니다.',
      cancelDrop:
        'cancel: pending intent를 버리고 action을 실행하지 않았습니다.',
      promiseFalse:
        'cancel: Promise를 false로 resolve하고 호출자 흐름을 중단했습니다.',
      confirmAlreadyRan: 'confirm: action은 request 시점에 이미 실행됐습니다.',
      confirmNoIntent:
        'confirm: 실행할 pending intent가 없어 아무 일도 일어나지 않았습니다.',
      confirmPending: 'confirm: pending intent를 실행하고 정리했습니다.',
      promiseTrue:
        'confirm: Promise를 true로 resolve하고 caller가 action을 이어갔습니다.',
    },
  },
  en: {
    title: 'Confirm Flow Simulator',
    description:
      'Run the same request in four different modes and watch what executes, what waits, and what gets remembered.',
    modesLabel: 'Flow mode',
    request: 'Request action',
    cancel: 'Cancel',
    confirm: 'Confirm',
    reset: 'Reset',
    dialogTitle: 'Unsaved changes',
    dialogDescription: 'Do you want to continue this action?',
    noDialog: 'No Dialog is open.',
    state: 'State',
    log: 'Event log',
    actionCount: 'Action ran',
    dialogOpen: 'Dialog open',
    pendingIntent: 'Pending intent',
    promise: 'Promise',
    empty: 'empty',
    stored: 'stored',
    open: 'open',
    closed: 'closed',
    idle: 'idle',
    pending: 'pending',
    resolvedTrue: 'resolved true',
    resolvedFalse: 'resolved false',
    ran: 'ran',
    notYet: 'not yet',
    statusHint:
      'The key is not whether the Dialog is open, but whether the next intent still exists.',
    modes: {
      naive: {
        label: 'Naive',
        short: 'open + run',
        description: 'Open the Dialog and run the action in the same handler.',
      },
      returnOnly: {
        label: 'Return only',
        short: 'open + return',
        description:
          'Stop the immediate run, but remember nothing for confirm later.',
      },
      pendingIntent: {
        label: 'Pending intent',
        short: 'store + commit',
        description: 'Store the intent and commit it from the confirm path.',
      },
      promise: {
        label: 'Promise',
        short: 'resolve + continue',
        description: 'Return the later user choice back to the caller.',
      },
    },
    logs: {
      reset: 'reset: state was cleared.',
      request: 'request: the user asked to run the action.',
      open: 'setIsConfirmOpen(true): scheduled the Dialog to appear.',
      naiveRun:
        'submit(): the action ran without waiting for the Dialog result.',
      returnOnlyStop:
        'return: the current handler ended, but no continuation was stored.',
      pendingStored:
        'pendingIntent = submit: stored the work that confirm should run.',
      promisePending:
        'confirm(): created a pending Promise and opened the Dialog.',
      cancelAfterRun: 'cancel: the Dialog closed, but the action already ran.',
      cancelClosed:
        'cancel: no stored work existed, so only the Dialog closed.',
      cancelDrop:
        'cancel: dropped the pending intent and did not run the action.',
      promiseFalse:
        'cancel: resolved the Promise with false and stopped the caller flow.',
      confirmAlreadyRan:
        'confirm: the action had already run during the request.',
      confirmNoIntent: 'confirm: there was no pending intent, so nothing ran.',
      confirmPending: 'confirm: ran the pending intent and cleaned it up.',
      promiseTrue:
        'confirm: resolved the Promise with true and the caller continued.',
    },
  },
};

const modeOrder: Mode[] = ['naive', 'returnOnly', 'pendingIntent', 'promise'];

function promiseLabel(status: PromiseStatus, copy: Copy) {
  if (status === 'pending') return copy.pending;
  if (status === 'resolvedTrue') return copy.resolvedTrue;
  if (status === 'resolvedFalse') return copy.resolvedFalse;
  return copy.idle;
}

function toneClass(tone: LogEntry['tone']) {
  if (tone === 'success') return 'text-[#59d499]';
  if (tone === 'warning') return 'text-[#ffc533]';
  if (tone === 'danger') return 'text-[#ff6161]';
  if (tone === 'info') return 'text-[#57c1ff]';
  return 'text-white/72';
}

export function ConfirmFlowSimulator({ locale = 'ko' }: { locale?: Locale }) {
  const copy = COPY[locale];
  const [mode, setMode] = useState<Mode>('returnOnly');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingIntent, setPendingIntent] = useState(false);
  const [promiseStatus, setPromiseStatus] = useState<PromiseStatus>('idle');
  const [actionCount, setActionCount] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: 1, tone: 'neutral', message: copy.statusHint },
  ]);
  const nextLogId = useRef(2);

  const currentMode = copy.modes[mode];

  const appendLogs = (entries: Omit<LogEntry, 'id'>[]) => {
    const startId = nextLogId.current;
    nextLogId.current += entries.length;
    setLogs((prev) => [
      ...entries.map((entry, index) => ({
        ...entry,
        id: startId + index,
      })),
      ...prev,
    ]);
  };

  const reset = () => {
    setDialogOpen(false);
    setPendingIntent(false);
    setPromiseStatus('idle');
    setActionCount(0);
    setLogs([
      { id: nextLogId.current++, tone: 'neutral', message: copy.logs.reset },
    ]);
  };

  const changeMode = (nextMode: Mode) => {
    setMode(nextMode);
    setDialogOpen(false);
    setPendingIntent(false);
    setPromiseStatus('idle');
    setActionCount(0);
    setLogs([
      {
        id: nextLogId.current++,
        tone: 'info',
        message: `${copy.modes[nextMode].label}: ${copy.modes[nextMode].description}`,
      },
    ]);
  };

  const runAction = () => {
    setActionCount((prev) => prev + 1);
  };

  const requestAction = () => {
    if (mode === 'naive') {
      setDialogOpen(true);
      runAction();
      appendLogs([
        { tone: 'info', message: copy.logs.request },
        { tone: 'info', message: copy.logs.open },
        { tone: 'danger', message: copy.logs.naiveRun },
      ]);
      return;
    }

    if (mode === 'returnOnly') {
      setDialogOpen(true);
      appendLogs([
        { tone: 'info', message: copy.logs.request },
        { tone: 'info', message: copy.logs.open },
        { tone: 'warning', message: copy.logs.returnOnlyStop },
      ]);
      return;
    }

    if (mode === 'pendingIntent') {
      setDialogOpen(true);
      setPendingIntent(true);
      appendLogs([
        { tone: 'info', message: copy.logs.request },
        { tone: 'info', message: copy.logs.open },
        { tone: 'success', message: copy.logs.pendingStored },
      ]);
      return;
    }

    setDialogOpen(true);
    setPromiseStatus('pending');
    appendLogs([
      { tone: 'info', message: copy.logs.request },
      { tone: 'success', message: copy.logs.promisePending },
    ]);
  };

  const cancelAction = () => {
    if (!dialogOpen) return;

    setDialogOpen(false);

    if (mode === 'naive') {
      appendLogs([{ tone: 'danger', message: copy.logs.cancelAfterRun }]);
      return;
    }

    if (mode === 'returnOnly') {
      appendLogs([{ tone: 'warning', message: copy.logs.cancelClosed }]);
      return;
    }

    if (mode === 'pendingIntent') {
      setPendingIntent(false);
      appendLogs([{ tone: 'success', message: copy.logs.cancelDrop }]);
      return;
    }

    setPromiseStatus('resolvedFalse');
    appendLogs([{ tone: 'success', message: copy.logs.promiseFalse }]);
  };

  const confirmAction = () => {
    if (!dialogOpen) return;

    setDialogOpen(false);

    if (mode === 'naive') {
      appendLogs([{ tone: 'danger', message: copy.logs.confirmAlreadyRan }]);
      return;
    }

    if (mode === 'returnOnly') {
      appendLogs([{ tone: 'warning', message: copy.logs.confirmNoIntent }]);
      return;
    }

    if (mode === 'pendingIntent') {
      if (pendingIntent) runAction();
      setPendingIntent(false);
      appendLogs([{ tone: 'success', message: copy.logs.confirmPending }]);
      return;
    }

    setPromiseStatus('resolvedTrue');
    runAction();
    appendLogs([{ tone: 'success', message: copy.logs.promiseTrue }]);
  };

  const statusItems = useMemo(
    () => [
      {
        label: copy.dialogOpen,
        value: dialogOpen ? copy.open : copy.closed,
        active: dialogOpen,
      },
      {
        label: copy.pendingIntent,
        value: pendingIntent ? copy.stored : copy.empty,
        active: pendingIntent,
      },
      {
        label: copy.promise,
        value: promiseLabel(promiseStatus, copy),
        active: promiseStatus === 'pending',
      },
      {
        label: copy.actionCount,
        value: actionCount > 0 ? `${copy.ran} x${actionCount}` : copy.notYet,
        active: actionCount > 0,
      },
    ],
    [actionCount, copy, dialogOpen, pendingIntent, promiseStatus],
  );

  return (
    <section className="not-prose my-8 max-w-full overflow-hidden rounded-xl border border-[#242728] bg-[#07080a] text-white">
      <div className="h-1.5 bg-[linear-gradient(135deg,#ff5757_0%,#a1131a_42%,transparent_42%,transparent_58%,#ff5757_58%,#a1131a_100%)]" />
      <div className="space-y-5 p-4 sm:p-5">
        <div className="flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2 text-xs font-medium tracking-[0.08em] text-white/52 uppercase">
              <Search className="h-3.5 w-3.5" />
              React Dialog Flow
            </div>
            <h3 className="m-0 text-xl leading-tight font-semibold text-[#f4f4f6]">
              {copy.title}
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#cdcdcd]">
              {copy.description}
            </p>
          </div>
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md border border-white/15 bg-[#101111] px-3 text-sm font-medium text-white transition-colors hover:bg-[#121212] focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:outline-none"
          >
            <RotateCcw className="h-4 w-4" />
            {copy.reset}
          </button>
        </div>

        <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1.12fr)_minmax(280px,0.88fr)]">
          <div className="min-w-0 space-y-4">
            <div>
              <div className="mb-2 text-xs font-medium tracking-[0.08em] text-white/52 uppercase">
                {copy.modesLabel}
              </div>
              <div
                className="grid max-w-full min-w-0 gap-2 sm:grid-cols-2"
                role="group"
              >
                {modeOrder.map((item) => {
                  const selected = item === mode;
                  const modeCopy = copy.modes[item];
                  return (
                    <button
                      key={item}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => changeMode(item)}
                      className={cn(
                        'min-w-0 rounded-lg border p-3 text-left transition-colors focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:outline-none',
                        selected
                          ? 'border-white/20 bg-[#121212]'
                          : 'border-white/10 bg-[#0d0d0d] hover:bg-[#101111]',
                      )}
                    >
                      <div className="flex min-w-0 flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                        <span className="min-w-0 text-sm font-medium break-words text-white">
                          {modeCopy.label}
                        </span>
                        <span className="max-w-full rounded bg-[#121212] px-1.5 py-0.5 text-[11px] break-words text-white/62">
                          {modeCopy.short}
                        </span>
                      </div>
                      <p className="mt-2 text-xs leading-5 text-white/58">
                        {modeCopy.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-xl border border-[#242728] bg-[#0d0d0d]">
              <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff6161]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#ffc533]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#59d499]" />
                <div className="ml-2 flex min-w-0 flex-1 items-center gap-2 rounded-md border border-white/10 bg-[#101111] px-2.5 py-1.5 text-xs text-white/62">
                  <Search className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{currentMode.description}</span>
                </div>
              </div>

              <div className="space-y-2 p-3">
                <CommandRow
                  active
                  icon={<Play className="h-4 w-4" />}
                  label={copy.request}
                  shortcut="Enter"
                  onClick={requestAction}
                />
                <CommandRow
                  icon={<X className="h-4 w-4" />}
                  label={copy.cancel}
                  shortcut="Esc"
                  onClick={cancelAction}
                  disabled={!dialogOpen}
                />
                <CommandRow
                  icon={<Check className="h-4 w-4" />}
                  label={copy.confirm}
                  shortcut="⌘ ↵"
                  onClick={confirmAction}
                  disabled={!dialogOpen}
                />
              </div>
            </div>

            <div
              className={cn(
                'rounded-xl border p-4 transition-colors',
                dialogOpen
                  ? 'border-white/20 bg-[#101111]'
                  : 'border-white/10 bg-[#0d0d0d]',
              )}
              aria-live="polite"
            >
              {dialogOpen ? (
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-sm font-semibold text-white">
                      {copy.dialogTitle}
                    </div>
                    <div className="mt-1 text-sm text-white/62">
                      {copy.dialogDescription}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={cancelAction}
                      className="inline-flex h-9 items-center justify-center rounded-md border border-white/15 px-3 text-sm text-white hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:outline-none"
                    >
                      {copy.cancel}
                    </button>
                    <button
                      type="button"
                      onClick={confirmAction}
                      className="inline-flex h-9 items-center justify-center rounded-md bg-white px-3 text-sm font-medium text-black hover:bg-white/90 focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:outline-none"
                    >
                      {copy.confirm}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-white/52">
                  <CircleDashed className="h-4 w-4" />
                  {copy.noDialog}
                </div>
              )}
            </div>
          </div>

          <div className="min-w-0 space-y-4">
            <div className="rounded-xl border border-[#242728] bg-[#0d0d0d] p-3">
              <div className="mb-3 flex items-center gap-2 text-xs font-medium tracking-[0.08em] text-white/52 uppercase">
                <Clock3 className="h-3.5 w-3.5" />
                {copy.state}
              </div>
              <div className="grid gap-2">
                {statusItems.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between gap-3 rounded-md border border-white/10 bg-[#101111] px-3 py-2"
                  >
                    <span className="text-xs text-white/52">{item.label}</span>
                    <span
                      className={cn(
                        'text-sm font-medium',
                        item.active ? 'text-white' : 'text-white/44',
                      )}
                    >
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-[#242728] bg-[#0d0d0d] p-3">
              <div className="mb-3 flex items-center gap-2 text-xs font-medium tracking-[0.08em] text-white/52 uppercase">
                <CornerDownRight className="h-3.5 w-3.5" />
                {copy.log}
              </div>
              <div className="max-h-[310px] space-y-2 overflow-y-auto pr-1">
                {logs.map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-md border border-white/10 bg-[#101111] px-3 py-2 text-xs leading-5"
                  >
                    <span className={toneClass(entry.tone)}>
                      {entry.message}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CommandRow({
  icon,
  label,
  shortcut,
  active = false,
  disabled = false,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  shortcut: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-colors focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:outline-none',
        active ? 'bg-[#121212]' : 'bg-transparent hover:bg-[#101111]',
        disabled && 'cursor-not-allowed opacity-45 hover:bg-transparent',
      )}
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#121212] text-white/72">
        {icon}
      </span>
      <span className="min-w-0 flex-1 text-sm font-medium text-white">
        {label}
      </span>
      <span className="rounded bg-[linear-gradient(180deg,#121212,#0d0d0d)] px-1.5 py-0.5 text-[11px] text-white/58">
        {shortcut}
      </span>
    </button>
  );
}
