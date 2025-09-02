import { BadgeProps } from '@/types';
import React from 'react';

const Badge: React.FC<BadgeProps> = ({ label, value }) => (
    <span className="inline-flex items-center rounded-md ring-1 ring-zinc-800 bg-zinc-900/30 px-2 py-1">
        {label}: {value || 'Unknown'}
    </span>
);

function isUnknown(val?: string | null): boolean {
    return !val || val.toLowerCase?.() === 'unknown' || val.toLowerCase?.() === 'n/a';
}

function fmt(val?: string | null, unit?: string): string {
    if (isUnknown(val)) { return 'Unknown'; }

    return unit ? `${val} ${unit}` : String(val);
}

export interface CharacterCardProps {
    name: string;
    imageUrl: string | null;
    labels: {
        species: string;
        homeworld: string;
        birthYear: string;
        gender: string;
        height: string;
        mass: string;
        eyeColor: string;
        hairColor: string;
        skinColor: string;
    };
    speciesName?: string | null;
    homeworldName?: string | null;
    vitals: {
        birthYear?: string | null;
        gender?: string | null;
        height?: string | null;
        mass?: string | null;
        eyeColor?: string | null;
        hairColor?: string | null;
        skinColor?: string | null;
    };
    fallbackImage: string;
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
    return (
        <div className="flex flex-col items-center gap-4">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-center">{name}</h1>

            {/* Image */}
            <div className="w-[200px] max-w-full aspect-[2/3] overflow-hidden rounded-lg ring-1 ring-zinc-800 bg-zinc-900/40">
                <img
                    src={imageUrl || fallbackImage}
                    alt={name}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                        if (e.currentTarget.src !== fallbackImage) {
                            e.currentTarget.src = fallbackImage;
                        }
                    }}
                    className="h-full w-full object-cover"
                />
            </div>

            {/* Badges */}
            <div className="flex flex-wrap justify-center gap-2 text-sm text-zinc-300">
                <Badge label={labels.species} value={speciesName || 'Unknown'} />
                <Badge label={labels.homeworld} value={homeworldName || 'Unknown'} />
            </div>

            {/* Info cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full text-base">
                <div className="rounded-lg ring-1 ring-zinc-800 p-3 bg-zinc-900/30">
                    <div className="uppercase tracking-widest text-[10px] text-zinc-400">{labels.birthYear}</div>
                    <div className="text-zinc-100 mt-1">{fmt(vitals.birthYear)}</div>
                </div>
                <div className="rounded-lg ring-1 ring-zinc-800 p-3 bg-zinc-900/30">
                    <div className="uppercase tracking-widest text-[10px] text-zinc-400">{labels.gender}</div>
                    <div className="text-zinc-100 mt-1">{fmt(vitals.gender)}</div>
                </div>
                <div className="rounded-lg ring-1 ring-zinc-800 p-3 bg-zinc-900/30">
                    <div className="uppercase tracking-widest text-[10px] text-zinc-400">{labels.height}</div>
                    <div className="text-zinc-100 mt-1">{isUnknown(vitals.height) ? 'Unknown' : `${vitals.height} cm`}</div>
                </div>
                <div className="rounded-lg ring-1 ring-zinc-800 p-3 bg-zinc-900/30">
                    <div className="uppercase tracking-widest text-[10px] text-zinc-400">{labels.mass}</div>
                    <div className="text-zinc-100 mt-1">{isUnknown(vitals.mass) ? 'Unknown' : `${vitals.mass} kg`}</div>
                </div>
                <div className="rounded-lg ring-1 ring-zinc-800 p-3 bg-zinc-900/30">
                    <div className="uppercase tracking-widest text-[10px] text-zinc-400">{labels.eyeColor}</div>
                    <div className="text-zinc-100 mt-1">{fmt(vitals.eyeColor)}</div>
                </div>
                <div className="rounded-lg ring-1 ring-zinc-800 p-3 bg-zinc-900/30">
                    <div className="uppercase tracking-widest text-[10px] text-zinc-400">{labels.hairColor}</div>
                    <div className="text-zinc-100 mt-1">{fmt(vitals.hairColor)}</div>
                </div>
                <div className="rounded-lg ring-1 ring-zinc-800 p-3 bg-zinc-900/30">
                    <div className="uppercase tracking-widest text-[10px] text-zinc-400">{labels.skinColor}</div>
                    <div className="text-zinc-100 mt-1">{fmt(vitals.skinColor)}</div>
                </div>
            </div>
        </div>
    );
};

export default CharacterCard;
