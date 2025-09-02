import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import type { OpeningCrawlCardProps } from '@/types';

import { normalizeOpeningCrawl } from '@/utils/normalize';

function OpeningCrawlCard({ crawl }: OpeningCrawlCardProps) {
  const { t } = useTranslation();
  const paragraphs = useMemo(() => normalizeOpeningCrawl(crawl ?? undefined), [crawl]);
  if (!paragraphs.length) { return null; }

  return (
    <div className="rounded-xl ring-1 ring-zinc-800 bg-zinc-900/40 p-4">
      <h3 className="text-lg font-semibold mb-2">{t('detail.labels.openingCrawl')}</h3>
      <div className="max-w-prose text-left space-y-4 text-base md:text-lg leading-7 text-zinc-200/95">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </div>
  );
}

export { OpeningCrawlCard };
export default memo(OpeningCrawlCard);
