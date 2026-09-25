import React, { useState, useEffect } from 'react';
import { supportService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  LifeBuoy,
  Send,
  MessageSquare,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  Plus
} from 'lucide-react';

const Support = () => {
  const { user, isAdmin } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);

  // New ticket form
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Technical Issue');
  const [priority, setPriority] = useState('Medium');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Admin response state
  const [respondingId, setRespondingId] = useState(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [responseStatus, setResponseStatus] = useState('Resolved');

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await supportService.getTickets({});
      setTickets(res.data?.tickets || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await supportService.createTicket({
        name: user?.name,
        email: user?.email,
        subject,
        category,
        priority,
        message
      });
      setShowNewTicketModal(false);
      setSubject('');
      setMessage('');
      fetchTickets();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit support ticket.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdminUpdate = async (id) => {
    try {
      await supportService.updateTicket(id, {
        status: responseStatus,
        adminResponse
      });
      setRespondingId(null);
      setAdminResponse('');
      fetchTickets();
    } catch (err) {
      alert('Failed to update ticket response.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <LifeBuoy className="h-5 w-5 text-cyan-600" />
            Agency Helpdesk & Technical Support
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Submit inquiries, request assistance regarding data anomalies, or report infrastructure issues.
          </p>
        </div>

        <button
          onClick={() => setShowNewTicketModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-xs transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>New Support Request</span>
        </button>
      </div>

      {/* Tickets List */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto text-cyan-600 mb-2" />
            Loading support inquiries...
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-10 rounded-2xl bg-white border border-slate-200/90 shadow-xs text-center text-slate-500 text-xs">
            <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
            <p className="font-bold text-slate-800 text-sm">No Open Inquiries</p>
            <p className="mt-0.5">Click "New Support Request" if you need technical assistance.</p>
          </div>
        ) : (
          tickets.map((t) => (
            <div
              key={t._id}
              className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900">{t.subject}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    {t.category}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    t.priority === 'Urgent' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-sky-50 text-sky-700 border border-sky-200'
                  }`}>
                    {t.priority}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                    t.status === 'Resolved' || t.status === 'Closed'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : t.status === 'In Progress'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-sky-50 text-sky-700 border-sky-200'
                  }`}>
                    {t.status}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {new Date(t.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="text-xs text-slate-700 leading-relaxed bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Inquiry by {t.name} ({t.email}):</p>
                {t.message}
              </div>

              {t.adminResponse && (
                <div className="text-xs text-emerald-900 leading-relaxed bg-emerald-50/80 p-3.5 rounded-xl border border-emerald-200/80 shadow-2xs">
                  <p className="text-[10px] font-bold text-emerald-700 uppercase mb-1">
                    Official Admin Response ({t.adminName || 'Admin'}):
                  </p>
                  {t.adminResponse}
                </div>
              )}

              {isAdmin && respondingId !== t._id && (
                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => {
                      setRespondingId(t._id);
                      setAdminResponse(t.adminResponse || '');
                    }}
                    className="text-xs text-cyan-700 hover:text-cyan-800 hover:underline font-semibold"
                  >
                    Respond / Update Status →
                  </button>
                </div>
              )}

              {isAdmin && respondingId === t._id && (
                <div className="pt-2 space-y-2 border-t border-slate-100">
                  <textarea
                    rows={2}
                    value={adminResponse}
                    onChange={(e) => setAdminResponse(e.target.value)}
                    placeholder="Type official administrative resolution..."
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-600 shadow-2xs"
                  />
                  <div className="flex items-center justify-between">
                    <select
                      value={responseStatus}
                      onChange={(e) => setResponseStatus(e.target.value)}
                      className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs text-slate-700 focus:outline-none"
                    >
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
                    </select>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setRespondingId(null)}
                        className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleAdminUpdate(t._id)}
                        className="px-3 py-1 rounded-lg text-xs font-bold bg-cyan-600 hover:bg-cyan-700 text-white shadow-xs"
                      >
                        Submit Response
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* New Ticket Modal */}
      {showNewTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <h3 className="font-bold text-sm text-slate-900">Create New Support Request</h3>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Data anomaly query on Karachi station"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-600 shadow-2xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-600 shadow-2xs"
                  >
                    <option value="Technical Issue">Technical Issue</option>
                    <option value="Data Issue">Data Issue</option>
                    <option value="Account Issue">Account Issue</option>
                    <option value="Dashboard Issue">Dashboard Issue</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-600 shadow-2xs"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Message Description</label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your issue or inquiry in detail..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-600 shadow-2xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowNewTicketModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 shadow-xs"
                >
                  {submitting ? 'Submitting...' : 'Send Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Support;