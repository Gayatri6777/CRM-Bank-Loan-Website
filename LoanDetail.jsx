import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate, formatDateTime, STATUS_COLORS, STATUS_LABELS, STATUS_FLOW, VALID_NEXT_STATUS, DOC_TYPE_LABELS } from '../utils/helpers';
import toast from 'react-hot-toast';
import { ArrowLeft, Edit, Upload, CheckCircle, XCircle, Clock, FileUp, Loader, ChevronRight, AlertTriangle, DollarSign, Eye, Trash2, RefreshCw } from 'lucide-react';

const DOC_TYPES = Object.entries(DOC_TYPE_LABELS).map(([value, label]) => ({ value, label }));

export default function LoanDetail() {
  const { id } = useParams();
  const { user, hasRole } = useAuth();
  const [loan, setLoan] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [checklist, setChecklist] = useState([]);
  const [completionPercent, setCompletionPercent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusModal, setStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusForm, setStatusForm] = useState({ remarks: '', queryReason: '', sanctionedAmount: '', disbursedAmount: '', disbursementDate: '' });
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({ documentType: 'aadhaar', documentNumber: '' });
  const fileRef = useRef(null);
  const [activeTab, setActiveTab] = useState('details');
  const [verifyingDoc, setVerifyingDoc] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(null);

  const fetchLoan = () => api.get(`/loans/${id}`).then(({ data }) => setLoan(data.data));
  const fetchDocs = () => api.get(`/documents/loan/${id}`).then(({ data }) => {
    setDocuments(data.data || []);
    setChecklist(data.checklist || []);
    setCompletionPercent(data.completionPercent || 0);
  });

  useEffect(() => {
    Promise.all([fetchLoan(), fetchDocs()]).finally(() => setLoading(false));
  }, [id]);

  const handleStatusUpdate = async () => {
    if (!newStatus) return toast.error('Please select a status');
    if (newStatus === 'query' && !statusForm.queryReason) return toast.error('Query reason is required');
    if (newStatus === 'sanction' && !statusForm.sanctionedAmount) return toast.error('Sanctioned amount is required');
    if (newStatus === 'disbursement' && !statusForm.disbursedAmount) return toast.error('Disbursed amount is required');

    setUpdating(true);
    try {
      await api.put(`/loans/${id}/status`, {
        status: newStatus,
        remarks: statusForm.remarks,
        queryReason: statusForm.queryReason,
        sanctionedAmount: statusForm.sanctionedAmount ? Number(statusForm.sanctionedAmount) : undefined,
        disbursedAmount: statusForm.disbursedAmount ? Number(statusForm.disbursedAmount) : undefined,
        disbursementDate: statusForm.disbursementDate || undefined
      });
      toast.success(`Status updated to ${STATUS_LABELS[newStatus]}`);
      await fetchLoan();
      setStatusModal(false);
      setNewStatus('');
      setStatusForm({ remarks: '', queryReason: '', sanctionedAmount: '', disbursedAmount: '', disbursementDate: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally { setUpdating(false); }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const file = fileRef.current?.files[0];
    if (!file) return toast.error('Select a file first');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('customer', loan.customer._id);
      fd.append('documentType', uploadForm.documentType);
      if (uploadForm.documentNumber) fd.append('documentNumber', uploadForm.documentNumber);
      await api.post(`/documents/upload/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Document uploaded successfully');
      await fetchDocs();
      setUploadForm({ documentType: 'aadhaar', documentNumber: '' });
      fileRef.current.value = '';
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally { setUploading(false); }
  };

  const handleVerify = async (docId, verificationStatus, rejectionReason) => {
    setVerifyingDoc(docId);
    try {
      await api.put(`/documents/${docId}/verify`, { verificationStatus, rejectionReason });
      toast.success(`Document ${verificationStatus}`);
      fetchDocs();
      setShowRejectInput(null);
      setRejectReason('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally { setVerifyingDoc(null); }
  };

  const handleDeleteDoc = async (docId) => {
    if (!confirm('Delete this document?')) return;
    try {
      await api.delete(`/documents/${docId}`);
      toast.success('Document deleted');
      fetchDocs();
    } catch { toast.error('Failed to delete'); }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader className="animate-spin text-blue-600" size={40} /></div>;
  if (!loan) return <div className="text-center py-20 text-slate-400">Loan not found</div>;

  const nextStatuses = VALID_NEXT_STATUS[loan.status] || [];
  const currentStepIdx = STATUS_FLOW.indexOf(loan.status);

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <Link to="/loans" className="flex items-center gap-1 text-slate-500 hover:text-slate-700 text-sm mb-1">
            <ArrowLeft size={14} /> Back to Loans
          </Link>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="page-title">{loan.loanId}</h1>
            <span className={`badge ${STATUS_COLORS[loan.status]} text-sm px-3 py-1`}>{STATUS_LABELS[loan.status]}</span>
            {loan.status === 'query' && (
              <span className="badge bg-orange-100 text-orange-700 text-xs flex items-center gap-1">
                <AlertTriangle size={12} /> Query Pending
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {nextStatuses.length > 0 && (
            <button onClick={() => setStatusModal(true)} className="btn-primary">
              <RefreshCw size={16} /> Update Status
            </button>
          )}
          <Link to={`/loans/${id}/edit`} className="btn-secondary"><Edit size={16} /> Edit</Link>
        </div>
      </div>

      {/* Status Flow Timeline */}
      <div className="card mb-6 overflow-x-auto">
        <div className="flex items-center min-w-max">
          {STATUS_FLOW.map((s, i) => {
            const isCompleted = currentStepIdx > i;
            const isCurrent = loan.status === s;
            const isQuery = s === 'query';
            return (
              <div key={s} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all
                    ${isCurrent ? 'bg-blue-600 text-white ring-4 ring-blue-100' :
                      isCompleted ? 'bg-emerald-500 text-white' :
                      isQuery ? 'bg-orange-200 text-orange-600' : 'bg-slate-200 text-slate-400'}`}>
                    {isCompleted ? <CheckCircle size={16} /> : i + 1}
                  </div>
                  <span className={`text-xs mt-1 whitespace-nowrap font-medium
                    ${isCurrent ? 'text-blue-600' : isCompleted ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {STATUS_LABELS[s]}
                  </span>
                </div>
                {i < STATUS_FLOW.length - 1 && (
                  <div className={`h-0.5 w-12 md:w-16 mx-1 mt-[-14px] ${isCompleted ? 'bg-emerald-400' : 'bg-slate-200'}`} />
                )}
              </div>
            );
          })}
          {['rejected', 'cancelled'].includes(loan.status) && (
            <div className="ml-4 flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle size={16} className="text-red-500" />
              </div>
              <span className="text-xs text-red-500 font-semibold capitalize">{loan.status}</span>
            </div>
          )}
        </div>
        {loan.queryReason && loan.status === 'query' && (
          <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle size={16} className="text-orange-500 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-sm font-semibold text-orange-800">Query Raised</div>
                <div className="text-sm text-orange-700">{loan.queryReason}</div>
                <div className="text-xs text-orange-500 mt-1">Please re-upload required documents and update status to Active</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-white border border-slate-200 rounded-xl p-1 w-fit">
        {['details', 'documents', 'history', 'commission'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${activeTab === tab ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
            {tab}
            {tab === 'documents' && completionPercent < 100 && <span className="ml-1 text-xs bg-amber-100 text-amber-700 px-1.5 rounded-full">{completionPercent}%</span>}
          </button>
        ))}
      </div>

      {/* Details Tab */}
      {activeTab === 'details' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="card">
              <h3 className="font-semibold text-slate-800 mb-4">Loan Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {[
                  ['Loan ID', loan.loanId],
                  ['Customer', `${loan.customer?.firstName} ${loan.customer?.lastName}`],
                  ['Mobile', loan.customer?.mobile],
                  ['Bank', loan.bank?.name],
                  ['Loan Type', loan.loanType?.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())],
                  ['Applied Amount', formatCurrency(loan.appliedAmount)],
                  ['Tenure', loan.tenure ? `${loan.tenure} months` : '-'],
                  ['Interest Rate', loan.interestRate ? `${loan.interestRate}%` : '-'],
                  ['Purpose', loan.purpose || '-'],
                  ['Priority', loan.priority?.toUpperCase() || '-'],
                  loan.sanctionedAmount ? ['Sanctioned Amount', formatCurrency(loan.sanctionedAmount)] : null,
                  loan.disbursedAmount ? ['Disbursed Amount', formatCurrency(loan.disbursedAmount)] : null,
                  loan.disbursementDate ? ['Disbursement Date', formatDate(loan.disbursementDate)] : null,
                ].filter(Boolean).map(([label, value]) => (
                  <div key={label}>
                    <div className="text-xs text-slate-400 mb-0.5">{label}</div>
                    <div className="font-medium text-slate-900">{value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h3 className="font-semibold text-slate-800 mb-4">Financial Profile</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {[
                  ['Employment', loan.employmentType?.replace('_', ' ') || '-'],
                  ['Monthly Income', loan.monthlyIncome ? formatCurrency(loan.monthlyIncome) : '-'],
                  ['Other Income', loan.otherIncome ? formatCurrency(loan.otherIncome) : '-'],
                  ['Existing EMI', loan.existingEmi ? formatCurrency(loan.existingEmi) : '-'],
                  ['CIBIL Score', loan.creditScore || '-'],
                  ['ITR Filed', loan.hasItr ? 'Yes' : 'No'],
                ].map(([label, value]) => (
                  <div key={label}>
                    <div className="text-xs text-slate-400 mb-0.5">{label}</div>
                    <div className={`font-medium ${label === 'CIBIL Score' ? (Number(value) >= 750 ? 'text-green-600' : Number(value) >= 650 ? 'text-amber-600' : value !== '-' ? 'text-red-600' : 'text-slate-900') : 'text-slate-900'}`}>
                      {value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {loan.propertyDetails?.hasOwnProperty && (
              <div className="card">
                <h3 className="font-semibold text-slate-800 mb-4">Property Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {[
                    ['Type', loan.propertyDetails.propertyType],
                    ['Value', loan.propertyDetails.propertyValue ? formatCurrency(loan.propertyDetails.propertyValue) : '-'],
                    ['Owner', loan.propertyDetails.ownerName || '-'],
                    ['Address', loan.propertyDetails.propertyAddress || '-'],
                  ].map(([label, value]) => (
                    <div key={label}><div className="text-xs text-slate-400 mb-0.5">{label}</div><div className="font-medium text-slate-900 capitalize">{value}</div></div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="card">
              <h3 className="font-semibold text-slate-800 mb-3">Team Assignment</h3>
              <div className="space-y-3 text-sm">
                {[
                  ['Marketing Exec', loan.assignedMarketingExec],
                  ['Bank Executive', loan.assignedBankExecutive],
                  ['Created By', loan.createdBy],
                ].map(([label, person]) => (
                  <div key={label} className="flex justify-between items-center">
                    <span className="text-slate-500">{label}</span>
                    {person ? (
                      <span className="font-medium bg-slate-100 px-2 py-0.5 rounded-full text-xs">{person.name}</span>
                    ) : <span className="text-slate-300 text-xs">Unassigned</span>}
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h3 className="font-semibold text-slate-800 mb-3">Documents</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Completion</span>
                  <span className={`font-bold ${completionPercent === 100 ? 'text-green-600' : 'text-amber-600'}`}>{completionPercent}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className={`h-2 rounded-full ${completionPercent === 100 ? 'bg-green-500' : 'bg-amber-500'}`}
                    style={{ width: `${completionPercent}%` }} />
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-slate-500">Total Uploaded</span>
                  <span className="font-bold text-slate-900">{documents.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-emerald-600">Verified</span>
                  <span className="font-bold text-emerald-700">{documents.filter(d => d.verificationStatus === 'verified').length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-red-500">Rejected</span>
                  <span className="font-bold text-red-600">{documents.filter(d => d.verificationStatus === 'rejected').length}</span>
                </div>
              </div>
            </div>

            {loan.remarks && (
              <div className="card bg-amber-50 border-amber-200">
                <h3 className="font-semibold text-amber-800 mb-2">Remarks</h3>
                <p className="text-sm text-amber-700">{loan.remarks}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Documents Tab */}
      {activeTab === 'documents' && (
        <div className="space-y-6">
          {/* Required Documents Checklist */}
          {checklist.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-slate-800 mb-3">Required Documents Checklist</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {checklist.map(item => (
                  <div key={item.type} className={`flex items-center gap-2 p-2 rounded-lg text-sm ${item.uploaded ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                    {item.uploaded ? <CheckCircle size={14} /> : <XCircle size={14} />}
                    <span>{DOC_TYPE_LABELS[item.type] || item.type}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Form */}
          <div className="card">
            <h3 className="font-semibold text-slate-800 mb-4">Upload Document</h3>
            <form onSubmit={handleUpload}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="label">Document Type <span className="text-red-500">*</span></label>
                  <select className="input-field" value={uploadForm.documentType}
                    onChange={e => setUploadForm(p => ({ ...p, documentType: e.target.value }))}>
                    {DOC_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Document Number</label>
                  <input className="input-field" value={uploadForm.documentNumber}
                    onChange={e => setUploadForm(p => ({ ...p, documentNumber: e.target.value }))}
                    placeholder="ID/reference number (optional)" />
                </div>
                <div>
                  <label className="label">File <span className="text-red-500">*</span></label>
                  <input type="file" ref={fileRef} className="input-field text-sm py-1.5"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" required />
                  <p className="text-xs text-slate-400 mt-1">PDF, JPG, PNG (max 10MB)</p>
                </div>
              </div>
              <button type="submit" disabled={uploading} className="btn-primary">
                {uploading ? <Loader size={16} className="animate-spin" /> : <FileUp size={16} />}
                {uploading ? 'Uploading...' : 'Upload Document'}
              </button>
            </form>
          </div>

          {/* Document List */}
          <div className="card p-0 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-semibold text-slate-800">Uploaded Documents ({documents.length})</h3>
            </div>
            {documents.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <Upload size={36} className="mx-auto mb-2 opacity-40" />
                <p>No documents uploaded yet</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    {['Type', 'Document No.', 'Uploaded By', 'Status', 'Date', 'Actions'].map(h => (
                      <th key={h} className="table-header">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {documents.map(doc => (
                    <tr key={doc._id} className="hover:bg-slate-50">
                      <td className="table-cell">
                        <span className="badge bg-slate-100 text-slate-700">{DOC_TYPE_LABELS[doc.documentType] || doc.documentType}</span>
                      </td>
                      <td className="table-cell text-xs font-mono text-slate-500">{doc.documentNumber || '-'}</td>
                      <td className="table-cell text-sm">{doc.uploadedBy?.name}</td>
                      <td className="table-cell">
                        <div>
                          <span className={`badge ${STATUS_COLORS[doc.verificationStatus]}`}>
                            {doc.verificationStatus}
                          </span>
                          {doc.verificationStatus === 'rejected' && doc.rejectionReason && (
                            <div className="text-xs text-red-500 mt-1">{doc.rejectionReason}</div>
                          )}
                        </div>
                      </td>
                      <td className="table-cell text-xs text-slate-400">{formatDate(doc.createdAt)}</td>
                      <td className="table-cell">
                        <div className="flex items-center gap-1">
                          <a href={`/${doc.filePath}`} target="_blank" rel="noreferrer"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50">
                            <Eye size={13} />
                          </a>
                          {hasRole('admin', 'bank_executive') && doc.verificationStatus === 'pending' && (
                            <>
                              <button onClick={() => handleVerify(doc._id, 'verified')}
                                disabled={verifyingDoc === doc._id}
                                className="flex items-center gap-1 text-xs px-2 py-1 bg-emerald-50 text-emerald-700 rounded hover:bg-emerald-100">
                                <CheckCircle size={11} /> Verify
                              </button>
                              {showRejectInput === doc._id ? (
                                <div className="flex gap-1 items-center">
                                  <input className="text-xs border rounded px-1 py-0.5 w-28" placeholder="Reason..."
                                    value={rejectReason} onChange={e => setRejectReason(e.target.value)} />
                                  <button onClick={() => handleVerify(doc._id, 'rejected', rejectReason)}
                                    className="text-xs px-1 py-0.5 bg-red-100 text-red-700 rounded">✓</button>
                                </div>
                              ) : (
                                <button onClick={() => setShowRejectInput(doc._id)}
                                  className="flex items-center gap-1 text-xs px-2 py-1 bg-red-50 text-red-700 rounded hover:bg-red-100">
                                  <XCircle size={11} /> Reject
                                </button>
                              )}
                            </>
                          )}
                          <button onClick={() => handleDeleteDoc(doc._id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="card">
          <h3 className="font-semibold text-slate-800 mb-4">Status History</h3>
          <div className="space-y-4">
            {[...(loan.statusHistory || [])].reverse().map((h, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${STATUS_COLORS[h.status]}`}>
                    <Clock size={14} />
                  </div>
                  {i < (loan.statusHistory?.length - 1) && <div className="w-0.5 h-8 bg-slate-200 mt-1" />}
                </div>
                <div className="pb-4 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`badge ${STATUS_COLORS[h.status]}`}>{STATUS_LABELS[h.status]}</span>
                    <span className="text-xs text-slate-400">{formatDateTime(h.changedAt)}</span>
                    <span className="text-xs text-slate-400">by <strong>{h.changedBy?.name || 'System'}</strong></span>
                  </div>
                  {h.queryReason && (
                    <div className="mt-1 text-sm text-orange-700 bg-orange-50 px-2 py-1 rounded">
                      <strong>Query:</strong> {h.queryReason}
                    </div>
                  )}
                  {h.remarks && <div className="text-sm text-slate-600 mt-1">{h.remarks}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Commission Tab */}
      {activeTab === 'commission' && (
        <div className="card">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <DollarSign size={18} /> Commission Details
          </h3>
          {loan.commission ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              {[
                ['Disbursed Amount', formatCurrency(loan.commission.disbursedAmount)],
                ['Commission Rate', `${loan.commission.commissionRate}%`],
                ['Total Commission', formatCurrency(loan.commission.commissionAmount)],
                ['Marketing Share', formatCurrency(loan.commission.marketingExecShare)],
                ['Bank Exec Share', formatCurrency(loan.commission.bankExecShare)],
                ['DSA Share', formatCurrency(loan.commission.dsaShare)],
                ['Status', loan.commission.status?.toUpperCase()],
                ['Generated', formatDate(loan.commission.createdAt)],
                ['Payment Ref', loan.commission.paymentReference || '-'],
              ].map(([label, value]) => (
                <div key={label} className="bg-slate-50 rounded-lg p-3">
                  <div className="text-xs text-slate-400 mb-0.5">{label}</div>
                  <div className="font-semibold text-slate-900">{value}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-slate-400">
              <DollarSign size={36} className="mx-auto mb-2 opacity-30" />
              <p>Commission will be auto-generated when loan reaches Disbursement status</p>
            </div>
          )}
        </div>
      )}

      {/* Status Update Modal */}
      {statusModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-1">Update Loan Status</h3>
              <p className="text-sm text-slate-500 mb-4">Current: <strong>{STATUS_LABELS[loan.status]}</strong></p>
              <div className="space-y-4">
                <div>
                  <label className="label">New Status <span className="text-red-500">*</span></label>
                  <div className="grid grid-cols-2 gap-2">
                    {nextStatuses.map(s => (
                      <button key={s} type="button" onClick={() => setNewStatus(s)}
                        className={`p-3 rounded-lg border-2 text-sm font-medium transition-all text-left ${newStatus === s ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 hover:border-blue-300'}`}>
                        <div className={`w-2 h-2 rounded-full inline-block mr-2 ${STATUS_COLORS[s]?.split(' ')[0]}`}></div>
                        {STATUS_LABELS[s]}
                      </button>
                    ))}
                  </div>
                </div>

                {newStatus === 'query' && (
                  <div>
                    <label className="label">Query Reason <span className="text-red-500">*</span></label>
                    <textarea className="input-field resize-none" rows={3}
                      value={statusForm.queryReason}
                      onChange={e => setStatusForm(p => ({ ...p, queryReason: e.target.value }))}
                      placeholder="Specify what documents or info are needed..." />
                  </div>
                )}

                {newStatus === 'sanction' && (
                  <div>
                    <label className="label">Sanctioned Amount (₹) <span className="text-red-500">*</span></label>
                    <input type="number" className="input-field"
                      value={statusForm.sanctionedAmount} placeholder={loan.appliedAmount}
                      onChange={e => setStatusForm(p => ({ ...p, sanctionedAmount: e.target.value }))} />
                  </div>
                )}

                {newStatus === 'disbursement' && (
                  <div className="space-y-3">
                    <div>
                      <label className="label">Disbursed Amount (₹) <span className="text-red-500">*</span></label>
                      <input type="number" className="input-field"
                        value={statusForm.disbursedAmount} placeholder={loan.sanctionedAmount || loan.appliedAmount}
                        onChange={e => setStatusForm(p => ({ ...p, disbursedAmount: e.target.value }))} />
                    </div>
                    <div>
                      <label className="label">Disbursement Date</label>
                      <input type="date" className="input-field"
                        value={statusForm.disbursementDate}
                        onChange={e => setStatusForm(p => ({ ...p, disbursementDate: e.target.value }))} />
                    </div>
                  </div>
                )}

                <div>
                  <label className="label">Remarks</label>
                  <textarea className="input-field resize-none" rows={2} value={statusForm.remarks}
                    onChange={e => setStatusForm(p => ({ ...p, remarks: e.target.value }))}
                    placeholder="Optional notes..." />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => { setStatusModal(false); setNewStatus(''); }} className="btn-secondary">Cancel</button>
                <button onClick={handleStatusUpdate} disabled={!newStatus || updating} className="btn-primary">
                  {updating ? <Loader size={16} className="animate-spin" /> : <ChevronRight size={16} />}
                  {updating ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
