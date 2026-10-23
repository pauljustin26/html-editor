import { AlertTriangle, XCircle, Info } from 'lucide-react';
import type { LintDiagnostic } from '../utils/htmlLinter';

interface DiagnosticsPanelProps {
  diagnostics: LintDiagnostic[];
  onDiagnosticClick: (diag: LintDiagnostic) => void;
}

export function DiagnosticsPanel({ diagnostics, onDiagnosticClick }: DiagnosticsPanelProps) {
  const errors = diagnostics.filter(d => d.severity === 'error');
  const warnings = diagnostics.filter(d => d.severity === 'warning');
  const infos = diagnostics.filter(d => d.severity === 'info');

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e]">
      <div className="flex items-center gap-3 px-3 py-1.5 bg-[#252526] border-b border-[#333333] text-[11px] shrink-0">
        <span className="flex items-center gap-1 text-[#f44747]">
          <XCircle size={12} /> {errors.length}
        </span>
        <span className="flex items-center gap-1 text-[#cca700]">
          <AlertTriangle size={12} /> {warnings.length}
        </span>
        <span className="flex items-center gap-1 text-[#569cd6]">
          <Info size={12} /> {infos.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {diagnostics.length === 0 ? (
          <div className="flex items-center justify-center h-full text-[12px] text-[#6b6b6b]">
            No issues found ✓
          </div>
        ) : (
          <div className="divide-y divide-[#333333]">
            {diagnostics.map((diag, i) => (
              <button
                key={i}
                onClick={() => onDiagnosticClick(diag)}
                className="w-full text-left px-3 py-1.5 hover:bg-[#2a2d2e] transition-colors cursor-pointer
                  focus:outline-none focus:bg-[#2a2d2e]"
              >
                <div className="flex items-start gap-2">
                  {diag.severity === 'error' && <XCircle size={13} className="text-[#f44747] mt-0.5 shrink-0" />}
                  {diag.severity === 'warning' && <AlertTriangle size={13} className="text-[#cca700] mt-0.5 shrink-0" />}
                  {diag.severity === 'info' && <Info size={13} className="text-[#569cd6] mt-0.5 shrink-0" />}
                  <div className="min-w-0">
                    <p className="text-[12px] text-[#cccccc] break-all">{diag.message}</p>
                    <p className="text-[11px] text-[#6b6b6b]">Ln {diag.line}, Col {diag.column}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
