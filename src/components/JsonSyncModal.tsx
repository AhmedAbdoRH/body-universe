import React, { useEffect, useState } from 'react';
import { Check, ClipboardPaste, Copy, RotateCcw, Upload, X, AlertCircle } from 'lucide-react';
import { HormonalSystemConfig, SimulationSnapshot } from '../types/simulator';
import { parseAndValidateConfig } from '../engine/simulator';

interface JsonSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: HormonalSystemConfig;
  snapshot: SimulationSnapshot;
  onApplyConfig: (nextConfig: HormonalSystemConfig) => void;
  onResetDefault: () => void;
}

export const JsonSyncModal: React.FC<JsonSyncModalProps> = ({
  isOpen,
  onClose,
  config,
  snapshot,
  onApplyConfig,
  onResetDefault,
}) => {
  const [editorText, setEditorText] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEditorText(JSON.stringify(config, null, 2));
      setErrorMsg(null);
      setStatusMsg(null);
      setCopied(false);
    }
  }, [isOpen, config]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editorText);
      setCopied(true);
      setErrorMsg(null);
      setStatusMsg('تم نسخ محتوى JSON إلى الحافظة بنجاح.');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setErrorMsg('تعذر الوصول للحافظة تلقائياً؛ يمكنك تحديد النص ونسخه يدوياً.');
    }
  };

  const applyRawJson = (raw: string, successLabel: string) => {
    const result = parseAndValidateConfig(raw);
    if (!result.ok) {
      setErrorMsg(result.error);
      setStatusMsg(null);
      return false;
    }
    onApplyConfig(result.config);
    setEditorText(JSON.stringify(result.config, null, 2));
    setErrorMsg(null);
    setStatusMsg(successLabel);
    return true;
  };

  const handleApplyFromEditor = () => {
    applyRawJson(editorText, 'تم استبدال البيانات وتحديث الخريطة فوراً.');
  };

  const handlePasteAndReplace = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      if (!clipText.trim()) {
        setErrorMsg('الحافظة فارغة؛ انسخ كود JSON أولاً أو الصقه في المحرر أدناه.');
        return;
      }
      setEditorText(clipText);
      applyRawJson(clipText, 'تم لصق الكود من الحافظة وتحديث الخريطة بنجاح.');
    } catch {
      setErrorMsg(
        'المتصفح يمنع قراءة الحافظة مباشرة؛ الصق الكود داخل المحرر أدناه ثم اضغط "تحديث الخريطة".'
      );
    }
  };

  const handleSnapshotToJson = () => {
    const cloned: HormonalSystemConfig = structuredClone(config);
    const customScenarioId = snapshot.activeScenario.isFreeMode
      ? 'free_snapshot'
      : snapshot.activeScenario.id;

    const impacts: Record<string, number> = {};
    for (const h of cloned.hormones) {
      const res = snapshot.hormones[h.id];
      if (res && Math.abs(res.delta) >= 0.5) {
        impacts[h.id] = Math.round(res.delta);
      }
    }

    const existing = cloned.scenarios.find((s) => s.id === customScenarioId);
    if (existing && !existing.isFreeMode && !existing.isBaseline) {
      existing.hormoneImpacts = impacts;
      existing.spiritualImpact = Math.round(snapshot.forces.spiritual?.delta ?? 0);
    } else if (!existing) {
      cloned.scenarios.push({
        id: customScenarioId,
        category: 'psychophysical',
        nameAr: 'سيناريو محفوظ من الوضع الحر',
        nameEn: 'Saved Free Snapshot',
        description: 'نسخة محفوظة من القيم الحالية في الوضع الحر.',
        hormoneImpacts: impacts,
        spiritualImpact: Math.round(snapshot.forces.spiritual?.delta ?? 0),
      });
    }

    setEditorText(JSON.stringify(cloned, null, 2));
    setErrorMsg(null);
    setStatusMsg('تم تضمين القيم اللحظية في المحرر — اضغط "تحديث الخريطة" لاعتمادها.');
  };

  const handleReset = () => {
    onResetDefault();
    setErrorMsg(null);
    setStatusMsg('تمت استعادة ملف JSON الافتراضي للمنظومة.');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="json-modal-title"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-slate-800 bg-slate-950/50">
          <div>
            <h2 id="json-modal-title" className="text-base sm:text-lg font-bold text-slate-100">
              ملف بيانات المنظومة (JSON)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              انسخ البنية الكاملة للقوى والهرمونات والسيناريوهات والأسهم، أو الصق كوداً جديداً لتحديث الخريطة فورياً.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق نافذة JSON"
            className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2 px-5 py-3 border-b border-slate-800 bg-slate-900">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-700 bg-slate-800 text-slate-100 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-400" aria-hidden="true" />
            ) : (
              <Copy className="w-4 h-4 text-slate-300" aria-hidden="true" />
            )}
            <span>{copied ? 'تم النسخ' : 'نسخ محتوى JSON'}</span>
          </button>

          <button
            type="button"
            onClick={handlePasteAndReplace}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-sky-500 text-slate-950 hover:bg-sky-400 transition-colors cursor-pointer"
          >
            <ClipboardPaste className="w-4 h-4" aria-hidden="true" />
            <span>لصق من الحافظة واستبدال</span>
          </button>

          <button
            type="button"
            onClick={handleApplyFromEditor}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4" aria-hidden="true" />
            <span>تحديث الخريطة من المحرر</span>
          </button>

          {snapshot.isFreeMode && (
            <button
              type="button"
              onClick={handleSnapshotToJson}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-amber-500/40 bg-amber-950/50 text-amber-200 hover:bg-amber-950 transition-colors cursor-pointer"
            >
              <span>تضمين قيم الوضع الحر</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors mr-auto cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>استعادة الافتراضي</span>
          </button>
        </div>

        {/* Validation / Status Feedback */}
        {errorMsg && (
          <div
            role="alert"
            className="mx-5 mt-3 px-3.5 py-2.5 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" aria-hidden="true" />
            <span>{errorMsg}</span>
          </div>
        )}
        {statusMsg && !errorMsg && (
          <div
            role="status"
            className="mx-5 mt-3 px-3.5 py-2.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2"
          >
            <Check className="w-4 h-4 shrink-0 text-emerald-400" aria-hidden="true" />
            <span>{statusMsg}</span>
          </div>
        )}

        {/* Monospace JSON Code Editor */}
        <div className="p-5 flex-1 min-h-0 flex flex-col">
          <label htmlFor="hormonal-json-editor" className="sr-only">
            محرر كود JSON الخاص بالخريطة الهرمونية
          </label>
          <textarea
            id="hormonal-json-editor"
            dir="ltr"
            spellCheck={false}
            value={editorText}
            onChange={(e) => {
              setEditorText(e.target.value);
              setErrorMsg(null);
            }}
            className="w-full flex-1 min-h-[320px] sm:min-h-[420px] p-4 rounded-xl border border-slate-700 bg-slate-950 text-slate-100 font-mono-num text-xs leading-relaxed resize-none focus:outline-2 focus:outline-sky-500"
          />
        </div>
      </div>
    </div>
  );
};
