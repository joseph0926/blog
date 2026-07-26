#!/usr/bin/env python3
"""`.harness/` 문서가 아직 현재 저장소를 설명하는지 검사한다.

bootstrap이 이 파일을 target repository의 `.harness/check.py`로 복사한다.
실행면 중립이므로 Claude Code와 Codex가 같은 파일을 호출한다.

  python3 .harness/check.py

exit 0  현재 상태와 맞음 (경고는 있을 수 있음)
exit 1  문서가 가리키는 경로가 사라졌거나 frontmatter가 깨짐
"""

import re
import subprocess
import sys
from pathlib import Path

DRIFT_WARN = 20
FRONTMATTER = re.compile(r"\A---\n(.*?)\n---\n", re.S)
FIELD = re.compile(r"^(updated|baseline_revision|status):\s*(.+)$", re.M)
STATUS_VALUES = {"current", "review-needed", "stale"}
IGNORE_DIRS = {".git", "node_modules", "dist", "build", ".next", ".turbo", "coverage"}
PATH_TOKEN = re.compile(r"`([^`\n]+)`")
HAS_EXTENSION = re.compile(r"\.\w{1,6}$")


def path_claim(token: str, root: Path) -> str | None:
    """backtick token이 경로 주장인지 판정한다.

    보수적으로 본다. 오탐이 한 번 나오면 사람은 이 검사를 통째로 무시한다.
    - 실제 주장: `apps/web/src/a.ts`, `docs/spec-packets/`, 루트에 실제로 있는 `turbo.json`
    - 산문: `pnpm@11.17.0`, `engines.node`, `type/short-kebab-case`, `example.com`, `.en.mdx`
    """
    token = token.strip()
    if " " in token or not token:
        return None
    if "*" in token:
        head = token.split("*", 1)[0].rstrip("/")
        if "/" not in head:
            return None
        token = head
    if "/" in token:
        return token if (token.endswith("/") or HAS_EXTENSION.search(token)) else None
    return token if (root / token).exists() else None


def repo_root() -> Path:
    try:
        out = subprocess.run(
            ["git", "rev-parse", "--show-toplevel"],
            capture_output=True, text=True, check=True,
        )
        return Path(out.stdout.strip())
    except (subprocess.CalledProcessError, FileNotFoundError):
        return Path.cwd()


def head_revision(root: Path) -> str | None:
    try:
        out = subprocess.run(
            ["git", "rev-parse", "HEAD"],
            cwd=root, capture_output=True, text=True, check=True,
        )
        return out.stdout.strip()
    except (subprocess.CalledProcessError, FileNotFoundError):
        return None


def drift_count(root: Path, baseline: str) -> int | None:
    try:
        out = subprocess.run(
            ["git", "rev-list", "--count", f"{baseline}..HEAD"],
            cwd=root, capture_output=True, text=True, check=True,
        )
        return int(out.stdout.strip())
    except (subprocess.CalledProcessError, FileNotFoundError, ValueError):
        return None


def read_frontmatter(path: Path) -> dict:
    match = FRONTMATTER.match(path.read_text(encoding="utf-8"))
    return dict(FIELD.findall(match.group(1))) if match else {}


def index_basenames(root: Path) -> set:
    """저장소 안의 모든 파일·디렉터리 이름. 하위 base 기준 참조를 구제한다."""
    names: set[str] = set()
    stack = [root]
    while stack:
        current = stack.pop()
        for entry in current.iterdir():
            if entry.name in IGNORE_DIRS:
                continue
            names.add(entry.name)
            if entry.is_dir():
                stack.append(entry)
    return names


def main() -> int:
    root = repo_root()
    harness = root / ".harness"
    if not harness.is_dir():
        print(f"{harness}: .harness/ 없음. bootstrap 모드가 먼저 필요하다.", file=sys.stderr)
        return 1

    docs = sorted(harness.glob("*.md")) + sorted(harness.glob("*/*.md"))
    if not docs:
        print(f"{harness}: 문서 없음", file=sys.stderr)
        return 1

    head = head_revision(root)
    basenames = index_basenames(root)
    errors: list[str] = []
    warnings: list[str] = []
    review: list[str] = []
    unresolved = 0

    for doc in docs:
        rel = doc.relative_to(root)
        meta = read_frontmatter(doc)

        for key in ("updated", "baseline_revision", "status"):
            if key not in meta:
                errors.append(f"{rel}: frontmatter에 {key} 없음")

        status = meta.get("status")
        if status and status not in STATUS_VALUES:
            errors.append(f"{rel}: status가 {'|'.join(sorted(STATUS_VALUES))} 중 하나가 아님 ({status})")
        if status == "review-needed":
            review.append(str(rel))

        baseline = meta.get("baseline_revision")
        if baseline and head:
            if baseline == head:
                pass
            else:
                count = drift_count(root, baseline)
                if count is None:
                    warnings.append(f"{rel}: baseline_revision을 git에서 찾을 수 없음 ({baseline[:12]})")
                elif count >= DRIFT_WARN:
                    warnings.append(f"{rel}: baseline 이후 커밋 {count}개. sync 모드를 검토한다")

        text = doc.read_text(encoding="utf-8")
        for raw in set(PATH_TOKEN.findall(text)):
            token = path_claim(raw, root)
            if token is None:
                continue
            if (root / token).exists():
                continue
            if Path(token.rstrip("/")).name in basenames:
                unresolved += 1
            elif token.endswith("/"):
                warnings.append(f"{rel}: 디렉터리를 찾을 수 없음 — {token} (부재를 서술한 것이면 무시한다)")
            else:
                errors.append(f"{rel}: 가리키는 경로가 없음 — {token}")

    for line in errors:
        print(f"[ERROR] {line}", file=sys.stderr)
    for line in warnings:
        print(f"[WARN]  {line}", file=sys.stderr)
    if review:
        print(f"[INFO]  status: review-needed — {', '.join(review)}", file=sys.stderr)
    if unresolved:
        print(f"[INFO]  루트 기준으로 못 찾았으나 저장소 안에 존재하는 참조 {unresolved}건 (하위 base 표기)", file=sys.stderr)

    if errors:
        return 1
    print(f".harness/ 문서 {len(docs)}개 확인. 경로 실존과 frontmatter 정상.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
