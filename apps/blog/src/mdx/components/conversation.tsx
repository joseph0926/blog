import { Bot, UserRound } from 'lucide-react';
import type { ReactNode } from 'react';
import styles from './conversation.module.css';

interface ConversationProps {
  label: string;
  children: ReactNode;
}

interface ChatMessageProps {
  from: 'user' | 'assistant';
  name: string;
  children: ReactNode;
}

export function Conversation({ label, children }: ConversationProps) {
  return (
    <ol aria-label={label} className={`not-prose ${styles.conversation}`}>
      {children}
    </ol>
  );
}

export function ChatMessage({ from, name, children }: ChatMessageProps) {
  const Avatar = from === 'user' ? UserRound : Bot;

  return (
    <li className={styles.message} data-from={from}>
      <div className={styles.author}>
        <span aria-hidden="true" className={styles.avatar}>
          <Avatar size={14} strokeWidth={1.75} />
        </span>
        <span>{name}</span>
      </div>
      <div className={styles.bubble}>{children}</div>
    </li>
  );
}
