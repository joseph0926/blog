import { Separator } from '@blog/ui/components/ui/separator';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About – YoungHoon Kim',
  description: '프로젝트 성과로 증명한 프론트엔드 개발자 김영훈의 성장 스토리',
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <header className="space-y-3">
        <h1 className="text-4xl font-bold tracking-tight">About Me</h1>
        <p className="text-muted-foreground">
          실전 프로젝트로 성장한 프론트엔드 개발자 <strong>김영훈</strong>의
          경력 이야기
        </p>
      </header>

      <Separator className="my-10" />

      <article className="prose dark:prose-invert max-w-none text-sm leading-relaxed">
        <p>
          <strong>2022년 초</strong>, 처음으로 개발 공부를 시작했습니다. 같은 해
          여름부터는 웹 개발, 그중에서도 <strong>프론트엔드</strong>에
          집중했습니다.
        </p>
        <p>
          개발에 발을 들인 계기는 단순했습니다. 전공인 공공정책학과 수업이 너무
          재미없었고, “그냥 놀기에는 아까우니 재미있어 보이는 것이라도 해
          보자”는 마음으로 유튜브 <strong>C/C++</strong> 강의를 들으며 코드를
          따라 쳤습니다.
        </p>
        <p>
          강의를 따라 코드를 작성하고 실행해 결과물을 확인하는 과정은 무척
          흥미로웠습니다. 그러나 이내 “코드 작성 → 결과 확인”보다 “코드를 어떻게
          작성해야 하는가”에 초점이 맞춰지면서 재미가 급격히 떨어졌습니다.
          지금은 그 중요성을 잘 이해하지만 당시에는 흥미를 잃었죠.
        </p>
        <p>
          그래서 시선을 <strong>웹 개발</strong>, 특히 프론트엔드로 돌렸습니다.
          프론트엔드는 “코드 작성 → 시각적 결과 확인”이 필수라 학습 단계에서도
          즉각적인 피드백이 있었습니다. 이 부분에 강한 매력을 느껴 “이 일을
          직업으로 삼자”고 결심했습니다.
        </p>
        <p>
          문제는 <strong>습관</strong>이었습니다. 공부법을 몰랐던 저는 서울대에
          다니는 친구에게 조언을 구했습니다. 친구는 “공부를 하든, 멍 때리든,
          잠을 자든 상관없이 매일 아침 2시간 카페나 독서실에 앉아 있어라”라고
          했습니다. 당시에는 이해하지 못했지만, 지금 돌이켜 보면 “습관을 먼저
          만들어라”는 의미였죠.
        </p>
        <p>
          아침 2시간 공부가 생활화되자 흥미가 떨어지거나 피곤해도 자연스럽게
          책상 앞에 앉게 됐습니다. 이 습관은 “아침 2시간 → 저녁 2시간 추가 →
          오후 2시간 추가”로 확장됐고, 회사에 다니는 지금도 유지하고 있습니다.
          예컨대 9시에 출근해야 하면 7시에 도착해 2시간 공부부터 시작합니다.
        </p>
        <p>
          학습 방식도 진화했습니다. 처음에는 강의를 따라 치며 “왜 안 되지?”를
          반복했다면, 이제는 스스로 코드를 작성하고 “왜 이렇게 설계했을까?”를
          자문합니다.
        </p>
        <p>
          이런 태도가 쌓여 <strong>2023년 7월, 판도라티비(코박)</strong>에
          합격했습니다. 코인 플랫폼의 프론트엔드 개발자로서 첫 임무는{' '}
          <strong>레거시 코드 개선</strong>이었습니다.
        </p>
        <p>
          당시 코박에는 프론트엔드 개발자가 저 혼자라 “React 16을 18로 올릴까?”,
          “Next.js로 갈까?”, “상태 관리는 무엇을 쓸까?” 같은 결정을 모두 스스로
          내려야 했습니다. 가장 중요한 원칙은 “다음 개발자가 별다른 히스토리
          파악 없이 바로 업무를 이어받을 수 있어야 한다”였습니다. 그래서
          커뮤니티가 크고 문서가 잘 갖춰진 <strong>대중적인 스택</strong>을
          선택했습니다.
        </p>
        <p>
          구체적으로는 React 16 <strong>클래스형 → 함수형</strong> 전환, 상태
          관리 <strong>dva → React Query</strong>(서버) + 
          <strong>Zustand</strong>(클라이언트), 디자인 시스템{' '}
          <strong>shadcn/ui</strong> 적용을 진행했습니다. 그 결과{' '}
          <strong>중복 API 호출 50 % 감소</strong>, 유저 QA(버그 제보){' '}
          <strong>5건 → 0 ~ 1건</strong>으로 획기적으로 줄였습니다.
        </p>
        <p>
          이후 <strong>웹뷰 레거시 개선</strong>을 맡아 모바일 개발자들과
          협업했습니다. 핵심 메타데이터는 postMessage로, 변동 가능성이 큰 자산
          정보는 API 호출로 분리해 효율을 높였습니다. 또{' '}
          <strong>다국어 지원</strong>과 <strong>SEO 개선</strong>을 진행하며
          구글 시트를 연동해 QA·기획팀 작업 기간을 <strong>7일 → 3일</strong>로
          단축했습니다.
        </p>
        <p>
          코박을 거의 100 % 리팩토링한 뒤 성장을 위해{' '}
          <strong>NHN Injeinc</strong>로 옮겼습니다. 더 큰 조직에서{' '}
          <strong>PR 문화</strong>와 <strong>JS 기초</strong>를 다시 다지는
          계기를 얻었습니다.
        </p>
        <p>
          다음 목표를 위해 <strong>EA Korea</strong>로 이직했습니다. 현재는
          프론트엔드를 주도하며 백엔드와 긴밀히 협업하고,{' '}
          <strong>테스트 코드</strong>와 <strong>수동 테스트</strong>를 병행해
          버그를 최소화하고 있습니다.
        </p>
        <p>—</p>
        <p>
          꾸준한 <strong>습관</strong>, 끈질긴 <strong>호기심</strong>, 그리고
          빠른 <strong>실행력</strong>으로 성장해 온 프론트엔드 개발자{' '}
          <strong>김영훈</strong>을 앞으로도 기대해 주세요.
        </p>
      </article>
    </main>
  );
}
