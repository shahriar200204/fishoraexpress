import React, { useState, useEffect } from 'react';
import { Merchant, SupportTicket, TicketCategory } from '../../types';
import { StorageService } from '../../lib/storage';
import { StatusBadge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { Headphones, Plus, MessageSquare, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface MerchantTicketsProps {
  merchant: Merchant;
}

export const MerchantTickets: React.FC<MerchantTicketsProps> = ({ merchant }) => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [category, setCategory] = useState<TicketCategory>('delivery_delay');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [relatedParcelId, setRelatedParcelId] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState('');
  const [error, setError] = useState('');

  const loadTickets = () => {
    setTickets(StorageService.getTicketsByMerchant(merchant.id));
  };

  useEffect(() => {
    loadTickets();
  }, [merchant]);

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!subject || !message) {
      setError('Please fill in both subject and message.');
      return;
    }

    try {
      StorageService.createTicket({
        merchantId: merchant.id,
        merchantName: merchant.businessName,
        subject: subject.trim(),
        category,
        relatedParcelId: relatedParcelId.trim() || undefined,
        message: message.trim(),
      });

      confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.6 },
      });

      setIsCreateOpen(false);
      setSubject('');
      setMessage('');
      setRelatedParcelId('');
      loadTickets();
    } catch (err: any) {
      setError(err.message || 'Failed to create ticket.');
    }
  };

  const handleReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim()) return;

    StorageService.addTicketMessage(selectedTicket.id, {
      senderId: merchant.id,
      senderName: merchant.businessName,
      senderRole: 'merchant',
      message: replyText.trim(),
    });

    setReplyText('');
    loadTickets();
    const updated = StorageService.getTicketsByMerchant(merchant.id).find((t) => t.id === selectedTicket.id);
    if (updated) setSelectedTicket(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Support Tickets & Inquiries
          </h2>
          <p className="text-xs text-slate-500">
            Open a priority ticket with our 24/7 operations & dispatch team.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition"
        >
          <Plus className="w-4 h-4" />
          Open Support Ticket
        </button>
      </div>

      {/* Tickets List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="divide-y divide-slate-100">
          {tickets.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No tickets submitted yet. If you have any parcel issues or queries, click 'Open Support Ticket'.
            </div>
          ) : (
            tickets.map((t) => (
              <div
                key={t.id}
                onClick={() => setSelectedTicket(t)}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 cursor-pointer transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-400">#{t.id}</span>
                    <span className="font-bold text-sm text-slate-900">{t.subject}</span>
                    <StatusBadge status={t.status} size="sm" />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="capitalize font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      {t.category.replace('_', ' ')}
                    </span>
                    {t.relatedParcelId && (
                      <span className="font-mono">Parcel: <b>{t.relatedParcelId}</b></span>
                    )}
                    <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="text-xs font-semibold text-blue-600 flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5" />
                  {t.messages.length} messages →
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Ticket Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Open New Support Ticket"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateTicket} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700 font-medium">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Issue Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TicketCategory)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 bg-white capitalize"
              >
                <option value="delivery_delay">Delivery Delay</option>
                <option value="pickup_issue">Pickup Issue</option>
                <option value="cod_dispute">COD / Settlement Dispute</option>
                <option value="damaged_parcel">Damaged / Lost Parcel</option>
                <option value="address_change">Customer Address Change</option>
                <option value="other">Other General Inquiry</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Related Parcel ID (Optional)</label>
              <input
                type="text"
                value={relatedParcelId}
                onChange={(e) => setRelatedParcelId(e.target.value)}
                placeholder="e.g. FX-100254"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 bg-white uppercase font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Subject *</label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Urgently need pickup from Banani shop"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Description / Message *</label>
            <textarea
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Provide all relevant details so our support team can investigate..."
              className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md"
            >
              Submit Ticket
            </button>
          </div>
        </form>
      </Modal>

      {/* Ticket Conversation Modal */}
      {selectedTicket && (
        <Modal
          isOpen={!!selectedTicket}
          onClose={() => setSelectedTicket(null)}
          title={`Ticket: ${selectedTicket.subject}`}
          subtitle={`ID: #${selectedTicket.id} • Category: ${selectedTicket.category}`}
          maxWidth="2xl"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-bold">Status:</span>
                <StatusBadge status={selectedTicket.status} size="sm" />
              </div>
              {selectedTicket.relatedParcelId && (
                <span className="font-mono text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded">
                  Parcel: {selectedTicket.relatedParcelId}
                </span>
              )}
            </div>

            {/* Conversation Messages Thread */}
            <div className="max-h-80 overflow-y-auto space-y-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
              {selectedTicket.messages.map((m) => {
                const isMerchant = m.senderRole === 'merchant';
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isMerchant ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1 px-1">
                      <span className="font-bold text-slate-700">{m.senderName}</span>
                      <span>• {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div
                      className={`p-3 rounded-2xl text-xs max-w-md ${
                        isMerchant
                          ? 'bg-blue-600 text-white rounded-br-xs'
                          : 'bg-white text-slate-900 border border-slate-200 rounded-bl-xs shadow-2xs'
                      }`}
                    >
                      {m.message}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Reply box */}
            <form onSubmit={handleReply} className="flex gap-2">
              <input
                type="text"
                required
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your message reply..."
                className="flex-1 px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1"
              >
                <Send className="w-3.5 h-3.5" />
                Reply
              </button>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
};
