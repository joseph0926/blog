import type { Metadata } from 'next';
import { TerminalAbout } from '@/components/about/terminal-about';
import { pageRobots } from '@/meta/robots';

export const metadata: Metadata = {
  title: 'About - YoungHoon Kim',
  description: '프로젝트 성과로 증명한 프론트엔드 개발자 김영훈의 성장 스토리',
  robots: pageRobots.about,
};

export default function AboutPage() {
  return <TerminalAbout />;
}
