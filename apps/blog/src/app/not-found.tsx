import { Button } from '@joseph0926/ui/components/button';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
      <div className="text-center">
        <h1 className="text-foreground mb-2 text-8xl font-bold">404</h1>
        <h2 className="text-foreground mb-4 text-2xl font-semibold">
          페이지를 찾을 수 없습니다
        </h2>
        <p className="text-muted-foreground mb-6 text-lg">
          요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
        </p>
      </div>
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/">홈으로 이동</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/blog">블로그 보기</Link>
        </Button>
      </div>
    </div>
  );
}
