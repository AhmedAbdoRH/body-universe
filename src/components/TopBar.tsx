import React from 'react';
import { Braces, Monitor, Smartphone } from 'lucide-react';

export type ArrowFilterMode = 'all' | 'forces' | 'hormones' | 'spiritual';
export type ViewMode = 'desktop' | 'mobile';

interface TopBarProps {
  title: string;
  arrowFilter: ArrowFilterMode;
  onChangeArrowFilter: (mode: ArrowFilterMode) => void;
  viewMode: ViewMode;
  onToggleViewMode: () => void;
  onOpenJsonModal: () => void;
  hasCustomConfig: boolean;
}

const FILTER_OPTIONS: { id: ArrowFilterMode; label: string }[] = [
  { id: 'all', label: 'كل المسارات' },
  { id: 'forces', label: 'القوى والهرمونات' },
  { id: 'hormones', label: 'تفاعل الهرمونات' },
  { id: 'spiritual', label: 'المسار الروحي' },
];

export const TopBar: React.FC<TopBarProps> = ({
  title,
  arrowFilter,
  onChangeArrowFilter,
  viewMode,
  onToggleViewMode,
  onOpenJsonModal,
  hasCustomConfig,
}) => {
  return (
    <header className="h-12 sm:h-13 bg-slate-900/95 border-b border-slate-800 px-3 sm:px-4 lg:px-6 flex items-center justify-between gap-2 sm:gap-4 lg:gap-6 shrink-0 z-30">
      {/* Zone 1: Single-line Brand Title */}
      <div className="min-w-0">
        <h1 className="text-[13px] sm:text-base lg:text-lg font-bold tracking-wide text-slate-100 whitespace-nowrap truncate">
          {title}
        </h1>
      </div>

      {/* Zone 2: Arrow Layer Filter Controls (Desktop) */}
      <nav
        aria-label="تصفية مسارات التأثير"
        className="hidden lg:flex items-center gap-1 bg-slate-950 border border-slate-800 p-1 rounded-lg shrink-0"
      >
        {FILTER_OPTIONS.map((opt) => {
          const active = arrowFilter === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChangeArrowFilter(opt.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400 ${
                active
                  ? 'bg-slate-800 text-slate-50 shadow-xs'
                  : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </nav>

      {/* Zone 3: View Mode Switch + JSON Sync */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <button
          type="button"
          data-testid="view-mode-toggle"
          onClick={onToggleViewMode}
          title={viewMode === 'desktop' ? 'التحويل إلى نسخة الموبايل' : 'التحويل إلى نسخة الكمبيوتر'}
          className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-semibold text-slate-100 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
        >
          {viewMode === 'desktop' ? (
            <>
              <Smartphone className="w-3.5 h-3.5 text-sky-400 shrink-0" aria-hidden="true" />
              <span>نسخة الموبايل</span>
            </>
          ) : (
            <>
              <Monitor className="w-3.5 h-3.5 text-sky-400 shrink-0" aria-hidden="true" />
              <span>نسخة الكمبيوتر</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onOpenJsonModal}
          className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 text-[11px] sm:text-xs font-semibold text-slate-950 bg-sky-400 hover:bg-sky-300 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
        >
          <Braces className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>{hasCustomConfig ? 'JSON (معدّل)' : 'ملف JSON'}</span>
        </button>
      </div>
    </header>
  );
};
