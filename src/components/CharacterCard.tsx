import React from 'react';
import { useTranslation } from 'react-i18next';

import type { BadgeProps, CharacterCardProps } from '@/types';

const Badge: React.FC<BadgeProps> = ({ label, value }) => {
  const { t } = useTranslation();
  return (
    <span className="inline-flex items-center rounded-md ring-1 ring-zinc-800 bg-zinc-900/30 px-2 py-1">
      {label}: {value || t('common.unknown')}
    </span>
  );
};

function isUnknown(val?: string | null): boolean {
  return !val || val.toLowerCase?.() === 'unknown' || val.toLowerCase?.() === 'n/a';
}

function fmt(val: string | null | undefined, unit: string | undefined, unknownLabel: string): string {
  if (isUnknown(val)) { return unknownLabel; }
  return unit ? `${val} ${unit}` : String(val);
}

const CharacterCard: React.FC<CharacterCardProps> = ({
  name,
  imageUrl,
  labels,
  speciesName,
  homeworldName,
  vitals,
  fallbackImage,
}) => {
  const { t } = useTranslation();
  const unknownLabel = t('common.unknown');
  return (
    <div className="flex flex-col items-center gap-4">
      <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-center">{name}</h1>

      {/* Image */}
      <div className="w-[200px] max-w-full aspect-[2/3] overflow-hidden rounded-lg ring-1 ring-zinc-800 bg-zinc-900/40">
        <img
          src={imageUrl || fallbackImage}
          alt={name}
          referrerPolicy="no-referrer"
          onError={(event) => {
            if (event.currentTarget.src !== fallbackImage) {
              event.currentTarget.src = fallbackImage;
            }
          }}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Badges */}
      <div className="flex flex-wrap justify-center gap-2 text-sm text-zinc-300">
        <Badge label={labels.species} value={speciesName || t('common.unknown')} />
        <Badge label={labels.homeworld} value={homeworldName || t('common.unknown')} />
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full text-base">
        <div className="rounded-lg ring-1 ring-zinc-800 p-3 bg-zinc-900/30">
          <div className="uppercase tracking-widest text-[10px] text-zinc-400">{labels.birthYear}</div>
          <div className="text-zinc-100 mt-1">{fmt(vitals.birthYear, undefined, unknownLabel)}</div>
        </div>
        <div className="rounded-lg ring-1 ring-zinc-800 p-3 bg-zinc-900/30">
          <div className="uppercase tracking-widest text-[10px] text-zinc-400">{labels.gender}</div>
          <div className="text-zinc-100 mt-1">{fmt(vitals.gender, undefined, unknownLabel)}</div>
        </div>
        <div className="rounded-lg ring-1 ring-zinc-800 p-3 bg-zinc-900/30">
          <div className="uppercase tracking-widest text-[10px] text-zinc-400">{labels.height}</div>
          <div className="text-zinc-100 mt-1">{isUnknown(vitals.height) ? unknownLabel : `${vitals.height} cm`}</div>
        </div>
        <div className="rounded-lg ring-1 ring-zinc-800 p-3 bg-zinc-900/30">
          <div className="uppercase tracking-widest text-[10px] text-zinc-400">{labels.mass}</div>
          <div className="text-zinc-100 mt-1">{isUnknown(vitals.mass) ? unknownLabel : `${vitals.mass} kg`}</div>
        </div>
        <div className="rounded-lg ring-1 ring-zinc-800 p-3 bg-zinc-900/30">
          <div className="uppercase tracking-widest text-[10px] text-zinc-400">{labels.eyeColor}</div>
          <div className="text-zinc-100 mt-1">{fmt(vitals.eyeColor, undefined, unknownLabel)}</div>
        </div>
        <div className="rounded-lg ring-1 ring-zinc-800 p-3 bg-zinc-900/30">
          <div className="uppercase tracking-widest text-[10px] text-zinc-400">{labels.hairColor}</div>
          <div className="text-zinc-100 mt-1">{fmt(vitals.hairColor, undefined, unknownLabel)}</div>
        </div>
        <div className="rounded-lg ring-1 ring-zinc-800 p-3 bg-zinc-900/30">
          <div className="uppercase tracking-widest text-[10px] text-zinc-400">{labels.skinColor}</div>
          <div className="text-zinc-100 mt-1">{fmt(vitals.skinColor, undefined, unknownLabel)}</div>
        </div>
      </div>
    </div>
  );
};

export default CharacterCard;
