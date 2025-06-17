import { Metadata } from 'next';
import { ReportNavbar } from '@/components/report/report-navbar';
import { ReportSidebar } from '@/components/report/report-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import ReactQueryProvider from '@/providers/react-query-provider';

export const metadata: Metadata = {
  title: '블로그 성능 대시보드',
  description:
    '블로그의 성능등을 버전별로 체크하고 개선되는 상황을 모니터링 가능한 대시보드입니다.',
};

export default function ReportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ReactQueryProvider>
      <div className="bg-background text-foreground flex h-screen w-full">
        <SidebarProvider>
          <ReportSidebar />
          <div className="from-background to-muted/40 flex min-h-screen flex-1 flex-col bg-gradient-to-b">
            <ReportNavbar />
            <main className="flex-1 overflow-y-auto p-6">{children}</main>
          </div>
        </SidebarProvider>
      </div>
    </ReactQueryProvider>
  );
}
