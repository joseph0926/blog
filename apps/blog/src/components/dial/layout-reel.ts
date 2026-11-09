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
  scalePerStep?: number;
  minimumScale?: number;
  minimumOpacity?: number;
  reserveFullHeight?: boolean;
};

const SCALE_PER_STEP = 0.26;
const OPACITY_PER_STEP = 0.34;

export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/**
 * `position`은 가운데에 올 항목의 연속 인덱스다. 1.5면 1번과 2번 사이를 지나는 중이다.
 * 기본은 축소한 높이만큼 쌓는다. reserveFullHeight는 원래 높이를 확보해 질문 사이 여백을 남긴다.
 * 항목은 `top: 50%`, `transform-origin: left top`인 절대 배치 요소여야 한다.
 */
export function layoutReel(
  items: HTMLElement[],
  position: number,
  {
    space,
    weight,
    scalePerStep = SCALE_PER_STEP,
    minimumScale = 0.35,
    minimumOpacity = 0,
    reserveFullHeight = false,
  }: ReelOptions,
) {
  if (items.length === 0) return;

  const heights = items.map((item) => item.offsetHeight);
  const scales = items.map((_, index) =>
    Math.max(minimumScale, 1 - Math.abs(index - position) * scalePerStep),
  );

  const tops: number[] = [];
  let cursor = 0;
  items.forEach((_, index) => {
    tops.push(cursor);
    cursor += heights[index] * (reserveFullHeight ? 1 : scales[index]) + space;
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
    item.style.opacity = String(
      Math.max(minimumOpacity, 1 - distance * OPACITY_PER_STEP),
    );
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
