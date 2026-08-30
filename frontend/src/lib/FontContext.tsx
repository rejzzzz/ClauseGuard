'use client';

import React, { createContext, useContext, useEffect, useState, useSyncExternalStore } from 'react';

export interface FontPreset {
  id: string;
  name: string;
  description: string;
  sans: string;
  serif: string;
  mono: string;
  sansVar: string;
  serifVar: string;
  monoVar: string;
}

export const FONT_PRESETS: FontPreset[] = [
  {
    id: 'sleek-modern',
    name: 'Ultra-Sleek Modern SaaS',
    description: 'Clean modern sans-serif (Inter) with geometric headings (Outfit) and sharp monospace.',
    sans: 'Inter, sans-serif',
    serif: 'Outfit, sans-serif',
    mono: 'JetBrains Mono, monospace',
    sansVar: 'var(--font-inter)',
    serifVar: 'var(--font-outfit)',
    monoVar: 'var(--font-jetbrains-mono)',
  },
  {
    id: 'pure-inter',
    name: 'Unified Minimalist (Pure Inter)',
    description: 'Single font family used by Linear.app & OpenAI for 100% visual consistency.',
    sans: 'Inter, sans-serif',
    serif: 'Inter, sans-serif',
    mono: 'JetBrains Mono, monospace',
    sansVar: 'var(--font-inter)',
    serifVar: 'var(--font-inter)',
    monoVar: 'var(--font-jetbrains-mono)',
  },
  {
    id: 'geometric-architecture',
    name: 'Razor-Sharp Geometric (Manrope + DM Sans)',
    description: 'High precision geometric headlines with clean DM Sans body font.',
    sans: 'DM Sans, sans-serif',
    serif: 'Manrope, sans-serif',
    mono: 'Space Mono, monospace',
    sansVar: 'var(--font-dm-sans)',
    serifVar: 'var(--font-manrope)',
    monoVar: 'var(--font-space-mono)',
  },
  {
    id: 'corporate-jakarta',
    name: 'Corporate SaaS (Plus Jakarta Sans)',
    description: 'Polished enterprise SaaS font pairing.',
    sans: 'Plus Jakarta Sans, sans-serif',
    serif: 'Plus Jakarta Sans, sans-serif',
    mono: 'JetBrains Mono, monospace',
    sansVar: 'var(--font-plus-jakarta-sans)',
    serifVar: 'var(--font-plus-jakarta-sans)',
    monoVar: 'var(--font-jetbrains-mono)',
  },
  {
    id: 'executive-legal-brief',
    name: 'Executive Legal Brief (Inter + Lora)',
    description: 'Crisp UI sans with elegant, sturdy legal serif for document headers.',
    sans: 'Inter, sans-serif',
    serif: 'Lora, serif',
    mono: 'JetBrains Mono, monospace',
    sansVar: 'var(--font-inter)',
    serifVar: 'var(--font-lora)',
    monoVar: 'var(--font-jetbrains-mono)',
  },
];

const STORAGE_KEY = 'clauseguard_font_preset';
const DEFAULT_PRESET_ID = 'sleek-modern';

const listeners = new Set<() => void>();

function subscribeFontPreset(callback: () => void) {
  listeners.add(callback);
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', callback);
  }
  return () => {
    listeners.delete(callback);
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', callback);
    }
  };
}

function getFontPresetSnapshot(): string {
  if (typeof window === 'undefined') return DEFAULT_PRESET_ID;
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved && FONT_PRESETS.some((p) => p.id === saved)) {
    return saved;
  }
  return DEFAULT_PRESET_ID;
}

function getServerFontPresetSnapshot(): string {
  return DEFAULT_PRESET_ID;
}

interface FontContextType {
  currentPreset: FontPreset;
  setPresetById: (id: string) => void;
  customSans: string;
  customSerif: string;
  customMono: string;
  setCustomSans: (sans: string) => void;
  setCustomSerif: (serif: string) => void;
  setCustomMono: (mono: string) => void;
  isCustom: boolean;
}

const FontContext = createContext<FontContextType | undefined>(undefined);

export function FontProvider({ children }: { children: React.ReactNode }) {
  const presetId = useSyncExternalStore(
    subscribeFontPreset,
    getFontPresetSnapshot,
    getServerFontPresetSnapshot
  );
  const [customSans, setCustomSans] = useState<string>('var(--font-inter)');
  const [customSerif, setCustomSerif] = useState<string>('var(--font-outfit)');
  const [customMono, setCustomMono] = useState<string>('var(--font-jetbrains-mono)');
  const [isCustom, setIsCustom] = useState<boolean>(false);

  const activePreset = FONT_PRESETS.find((p) => p.id === presetId) || FONT_PRESETS[0];

  useEffect(() => {
    const root = document.documentElement;
    if (isCustom) {
      root.style.setProperty('--font-sans', customSans);
      root.style.setProperty('--font-serif', customSerif);
      root.style.setProperty('--font-mono', customMono);
    } else {
      root.style.setProperty('--font-sans', activePreset.sansVar);
      root.style.setProperty('--font-serif', activePreset.serifVar);
      root.style.setProperty('--font-mono', activePreset.monoVar);
    }
  }, [presetId, isCustom, customSans, customSerif, customMono, activePreset]);

  const setPresetById = (id: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, id);
    }
    setIsCustom(false);
    listeners.forEach((listener) => listener());
  };

  return (
    <FontContext.Provider
      value={{
        currentPreset: activePreset,
        setPresetById,
        customSans,
        customSerif,
        customMono,
        setCustomSans: (s) => { setCustomSans(s); setIsCustom(true); },
        setCustomSerif: (s) => { setCustomSerif(s); setIsCustom(true); },
        setCustomMono: (m) => { setCustomMono(m); setIsCustom(true); },
        isCustom,
      }}
    >
      {children}
    </FontContext.Provider>
  );
}

export function useFont() {
  const context = useContext(FontContext);
  if (!context) {
    throw new Error('useFont must be used within a FontProvider');
  }
  return context;
}
