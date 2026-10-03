// 다이얼 회전 문법 (ADR 0006). 홈 질문 다이얼, 글 절 다이얼, about 장 다이얼과 작업 기록 릴이 공유한다.
// 가운데 항목은 크고 굵고 진하며, 가운데에서 멀수록 작고 옅고 가늘어진다.

export type ReelWeight = {
  center: number;
  edge: number;
};

export type ReelOptions = {
  /** 항목 사이 간격(px) */
  space: number;
  weight: ReelWeight;
};

const SCALE_PER_STEP = 0.26;
const SCALE_FLOOR_DISTANCE = 2.5;
const OPACITY_PER_STEP = 0.34;

export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/**
 * `position`은 가운데에 올 항목의 연속 인덱스다. 1.5면 1번과 2번 사이를 지나는 중이다.
 * 각 항목의 실제 높이를 축소 비율만큼 쌓아 배치하므로 줄 수가 달라도 겹치지 않는다.
 * 항목은 `top: 50%`, `transform-origin: left top`인 절대 배치 요소여야 한다.
 */
export function layoutReel(
  items: HTMLElement[],
  position: number,
  { space, weight }: ReelOptions,
) {
  if (items.length === 0) return;

  const heights = items.map((item) => item.offsetHeight);
  const scales = items.map(
    (_, index) =>
      1 -
      Math.min(Math.abs(index - position), SCALE_FLOOR_DISTANCE) *
        SCALE_PER_STEP,
  );

  const tops: number[] = [];
  let cursor = 0;
  items.forEach((_, index) => {
    tops.push(cursor);
    cursor += heights[index] * scales[index] + space;
  });

  const centerOf = (index: number) =>
    tops[index] + (heights[index] * scales[index]) / 2;
  const lower = Math.floor(position);
  const upper = Math.min(lower + 1, items.length - 1);
  const focusY =
    centerOf(lower) + (centerOf(upper) - centerOf(lower)) * (position - lower);

  items.forEach((item, index) => {
    const distance = Math.abs(index - position);
    item.style.transform = `translateY(${tops[index] - focusY}px) scale(${scales[index]})`;
    item.style.opacity = String(Math.max(0, 1 - distance * OPACITY_PER_STEP));
    item.style.fontWeight = String(
      Math.round(
        weight.center - Math.min(distance, 1) * (weight.center - weight.edge),
      ),
    );
  });
}

/** 정적 목록으로 돌아갈 때 회전이 남긴 인라인 스타일을 지운다. */
export function clearReel(items: HTMLElement[]) {
  items.forEach((item) => {
    item.style.transform = '';
    item.style.opacity = '';
    item.style.fontWeight = '';
  });
}
