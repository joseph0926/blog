export function generateSlug(title: string): string {
  const romanized = romanizeKorean(title);

  const slug = romanized
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return slug || `post-${Date.now()}`;
}

function romanizeKorean(text: string): string {
  const 초성 = [
    'g',
    'kk',
    'n',
    'd',
    'tt',
    'r',
    'm',
    'b',
    'pp',
    's',
    'ss',
    '',
    'j',
    'jj',
    'ch',
    'k',
    't',
    'p',
    'h',
  ];
  const 중성 = [
    'a',
    'ae',
    'ya',
    'yae',
    'eo',
    'e',
    'yeo',
    'ye',
    'o',
    'wa',
    'wae',
    'oe',
    'yo',
    'u',
    'wo',
    'we',
    'wi',
    'yu',
    'eu',
    'ui',
    'i',
  ];
  const 종성 = [
    '',
    'k',
    'k',
    'k',
    'n',
    'n',
    'n',
    'l',
    'l',
    'l',
    'l',
    'l',
    'l',
    'l',
    'l',
    'm',
    'p',
    'p',
    't',
    't',
    'ng',
    't',
    't',
    'k',
    't',
    'p',
    't',
  ];

  return text
    .split('')
    .map((char) => {
      const code = char.charCodeAt(0);

      if (code < 0xac00 || code > 0xd7a3) {
        return char;
      }

      const offset = code - 0xac00;
      const 초 = Math.floor(offset / 588);
      const 중 = Math.floor((offset % 588) / 28);
      const 종 = offset % 28;

      return 초성[초] + 중성[중] + 종성[종];
    })
    .join('');
}

export function generatePostContent({
  date,
  slug,
  title,
  description,
  tags,
}: {
  date: string;
  slug: string;
  title: string;
  description: string;
  tags: string[];
}) {
  return `---\nslug: \"${date}-${slug}\"\ntitle: \"${title}\"\ndescription: \"${description}\"\ndate: \"${date}\"\ntags: [${tags.map((tag) => `\"${tag}\"`).join(', ')}]\n---\n\n여기에 글을 작성하세요.\n`;
}
