import React, { useEffect, useState } from 'react';
import { Award, CheckCircle2, Download, Eye, FileText, Printer, ShieldCheck } from 'lucide-react';
import { api, CertificateItem } from '../../services/api';
import { CertificateModal } from '../../components/ui/certificate-view';

interface CertificatesPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const CertificatesPage: React.FC<CertificatesPageProps> = ({ onNavigate }) => {
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState<CertificateItem | null>(null);

  useEffect(() => {
    const loadCerts = async () => {
      try {
        const res = await api.certificates.getAll();
        setCertificates(res.certificates);
      } catch (err) {
        console.error('Failed to load certificates', err);
      } finally {
        setLoading(false);
      }
    };
    loadCerts();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-soft">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
          Verified Credentials
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3">
          Your Earned Certificates
        </h2>
        <p className="text-slate-600 text-sm mt-1">
          Accredited credentials awarded upon successful completion of curriculum modules and passing score in the certification assessment.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : certificates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft hover:shadow-soft-lg hover:border-amber-300 transition duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                      <Award className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Verified Credential
                      </span>
                      <h3 className="text-base font-bold text-slate-900">{cert.course_title}</h3>
                    </div>
                  </div>
                </div>

                <div className="py-4 space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Awarded To:</span>
                    <strong className="text-slate-800">{cert.trainee_name}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Instructor:</span>
                    <span className="text-slate-700">{cert.trainer_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Issue Date:</span>
                    <span className="text-slate-700">{cert.issue_date}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-100 font-mono text-[11px]">
                    <span className="text-slate-400">Credential ID:</span>
                    <span className="text-brand-600 font-semibold">{cert.certificate_code}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex gap-2">
                <button
                  onClick={() => setSelectedCert(cert)}
                  className="flex-1 py-2 px-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Certificate</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-200">
          <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No certificates earned yet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Complete all modules of an enrolled course and pass the final assessment quiz to earn your verified credential!
          </p>
          <button
            onClick={() => onNavigate('courses-browse')}
            className="mt-4 px-5 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-semibold hover:bg-brand-700 transition shadow-xs"
          >
            Explore Courses
          </button>
        </div>
      )}

      {selectedCert && (
        <CertificateModal
          certificate={selectedCert}
          onClose={() => setSelectedCert(null)}
        />
      )}
    </div>
  );
};
