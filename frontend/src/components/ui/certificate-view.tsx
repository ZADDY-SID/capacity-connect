import React, { useRef } from 'react';
import { Award, CheckCircle2, Download, Printer, ShieldCheck, X } from 'lucide-react';
import { CertificateItem } from '../../services/api';

interface CertificateModalProps {
  certificate: CertificateItem | null;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({ certificate, onClose }) => {
  const certRef = useRef<HTMLDivElement | null>(null);

  if (!certificate) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadImage = () => {
    const certEl = certRef.current;
    if (!certEl) return;

    // Use HTML5 canvas to generate a downloadable certificate image
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 850;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 1200, 850);

    // Decorative Borders
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 14;
    ctx.strokeRect(20, 20, 1160, 810);

    ctx.strokeStyle = '#8b5cf6';
    ctx.lineWidth = 3;
    ctx.strokeRect(36, 36, 1128, 778);

    // Header Branding
    ctx.fillStyle = '#6d28d9';
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CAPACITY CONNECT', 600, 110);

    ctx.fillStyle = '#64748b';
    ctx.font = 'italic 18px sans-serif';
    ctx.fillText('Learn. Grow. Achieve.', 600, 145);

    // Certificate Title
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 44px sans-serif';
    ctx.fillText('CERTIFICATE OF ACHIEVEMENT', 600, 230);

    ctx.fillStyle = '#64748b';
    ctx.font = '20px sans-serif';
    ctx.fillText('This official credential is proudly awarded to', 600, 290);

    // Trainee Name
    ctx.fillStyle = '#1e1b4b';
    ctx.font = 'bold 48px sans-serif';
    ctx.fillText(certificate.trainee_name, 600, 370);

    // Underline
    ctx.strokeStyle = '#a78bfa';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(350, 395);
    ctx.lineTo(850, 395);
    ctx.stroke();

    // Course Title
    ctx.fillStyle = '#475569';
    ctx.font = '22px sans-serif';
    ctx.fillText('for successfully completing all curriculum modules and passing the final assessment in', 600, 445);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText(certificate.course_title, 600, 505);

    // Signatures and Dates
    // Trainer
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(certificate.trainer_name, 160, 670);
    ctx.fillStyle = '#64748b';
    ctx.font = '16px sans-serif';
    ctx.fillText('Authorized Instructor', 160, 700);

    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(160, 640);
    ctx.lineTo(380, 640);
    ctx.stroke();

    // Date
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText(certificate.issue_date, 820, 670);
    ctx.fillStyle = '#64748b';
    ctx.font = '16px sans-serif';
    ctx.fillText('Issue Date', 820, 700);

    ctx.strokeStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.moveTo(820, 640);
    ctx.lineTo(1040, 640);
    ctx.stroke();

    // Verification ID
    ctx.textAlign = 'center';
    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px monospace';
    ctx.fillText(`Certificate ID: ${certificate.certificate_code} • Verified by Capacity Connect Local Engine`, 600, 765);

    // Download trigger
    const link = document.createElement('a');
    link.download = `Certificate_${certificate.certificate_code}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-brand-600" />
            <h3 className="font-semibold text-slate-800">Official Certificate of Achievement</h3>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition shadow-sm"
              title="Print or Save as PDF"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={handleDownloadImage}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition shadow-sm shadow-brand-500/20"
              title="Download PNG Certificate"
            >
              <Download className="w-4 h-4" />
              <span>Download PNG</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Printable Canvas / Layout */}
        <div className="p-6 md:p-10 flex justify-center bg-slate-100 overflow-x-auto">
          <div
            id="printable-certificate"
            ref={certRef}
            className="w-full max-w-[850px] aspect-[1.414/1] bg-white rounded-xl shadow-lg border-8 border-double border-slate-200 p-8 md:p-12 relative flex flex-col justify-between select-none"
          >
            {/* Corner Decorative Accents */}
            <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-brand-500" />
            <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-brand-500" />
            <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-brand-500" />
            <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-brand-500" />

            {/* Top Branding */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-brand-600 to-sky-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                  C
                </div>
                <span className="text-xl font-bold tracking-wider text-slate-900 uppercase">
                  Capacity <span className="text-brand-600">Connect</span>
                </span>
              </div>
              <p className="text-xs font-medium text-slate-500 tracking-widest uppercase">
                Learn • Grow • Achieve
              </p>
            </div>

            {/* Title & Recipient */}
            <div className="text-center my-4">
              <span className="text-xs font-semibold tracking-widest uppercase text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
                Certificate of Completion
              </span>
              <p className="text-slate-500 text-sm mt-4">This acknowledges that</p>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-1 font-serif tracking-tight border-b-2 border-brand-200 inline-block pb-1 px-8">
                {certificate.trainee_name}
              </h1>
              <p className="text-slate-600 text-sm mt-3 max-w-lg mx-auto">
                has successfully fulfilled all curriculum requirements, practical assignments, and final assessment standards for
              </p>
              <h2 className="text-lg md:text-xl font-bold text-brand-700 mt-2">
                {certificate.course_title}
              </h2>
            </div>

            {/* Bottom Signatures & Seal */}
            <div className="flex items-end justify-between border-t border-slate-100 pt-6 mt-4">
              <div className="text-left">
                <div className="font-serif italic text-lg text-slate-800 font-bold border-b border-slate-300 pb-1 mb-1">
                  {certificate.trainer_name}
                </div>
                <p className="text-xs text-slate-500 font-medium">Certified Instructor</p>
              </div>

              {/* Seal */}
              <div className="text-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 p-0.5 shadow-md flex items-center justify-center">
                  <div className="w-full h-full rounded-full border border-dashed border-white/80 flex flex-col items-center justify-center text-white">
                    <ShieldCheck className="w-6 h-6" />
                    <span className="text-[8px] font-bold tracking-tighter uppercase mt-0.5">Verified</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm font-semibold text-slate-800 border-b border-slate-300 pb-1 mb-1">
                  {certificate.issue_date}
                </div>
                <p className="text-xs text-slate-500 font-medium">Issue Date</p>
              </div>
            </div>

            {/* Footer Verification Code */}
            <div className="text-center mt-3 text-[10px] text-slate-400 font-mono flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              <span>Credential ID: <strong className="text-slate-600">{certificate.certificate_code}</strong></span>
              <span>• Verified on Capacity Connect</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
