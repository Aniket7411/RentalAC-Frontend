import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { Ticket, AlertCircle, MessageSquare, CheckCircle, XCircle, Loader2, Search, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/Toast';

const Tickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, new, open, in-progress, resolved, closed
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showRemarkModal, setShowRemarkModal] = useState(false);
  const [remark, setRemark] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [addingRemark, setAddingRemark] = useState(false);
  const { toasts, removeToast, success, error: showError } = useToast();

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiService.getAllTickets();
      if (response.success) {
        setTickets(response.data || []);
      } else {
        setError(response.message || 'Failed to load tickets');
        showError(response.message || 'Failed to load tickets');
      }
    } catch (err) {
      setError('An error occurred while loading tickets');
      showError('An error occurred while loading tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (ticketId, newStatus) => {
    setUpdatingStatus(ticketId);
    try {
      const response = await apiService.updateTicketStatus(ticketId, newStatus);
      if (response.success) {
        success('Ticket status updated successfully');
        loadTickets();
      } else {
        showError(response.message || 'Failed to update status');
      }
    } catch (err) {
      showError('An error occurred while updating status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleAddRemark = async () => {
    if (!remark.trim()) {
      showError('Please enter a remark');
      return;
    }

    setAddingRemark(true);
    try {
      const response = await apiService.addTicketRemark(selectedTicket._id || selectedTicket.id, remark.trim());
      if (response.success) {
        success('Remark added successfully');
        setRemark('');
        setShowRemarkModal(false);
        setSelectedTicket(null);
        loadTickets();
      } else {
        showError(response.message || 'Failed to add remark');
      }
    } catch (err) {
      showError('An error occurred while adding remark');
    } finally {
      setAddingRemark(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'open':
      case 'in progress':
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      case 'new':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    const matchesFilter =
      filter === 'all' ||
      ticket.status?.toLowerCase() === filter.toLowerCase() ||
      (filter === 'in-progress' && ticket.status?.toLowerCase() === 'in progress');

    const matchesSearch =
      !searchTerm ||
      ticket.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const statusCounts = {
    all: tickets.length,
    new: tickets.filter((t) => t.status?.toLowerCase() === 'new').length,
    open: tickets.filter((t) => t.status?.toLowerCase() === 'open').length,
    'in-progress': tickets.filter((t) => t.status?.toLowerCase() === 'in progress' || t.status?.toLowerCase() === 'in-progress').length,
    resolved: tickets.filter((t) => t.status?.toLowerCase() === 'resolved').length,
    closed: tickets.filter((t) => t.status?.toLowerCase() === 'closed').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary-blue" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ToastContainer toasts={toasts} removeToast={removeToast} />
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-primary-blue rounded-lg">
              <Ticket className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-text-dark">Support Tickets</h1>
              <p className="text-text-light">Manage and resolve customer support tickets</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center space-x-2">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search tickets by subject, description, or user..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-5 h-5 text-gray-500" />
              {['all', 'new', 'open', 'in-progress', 'resolved', 'closed'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === status
                      ? 'bg-primary-blue text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')} ({statusCounts[status] || 0})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tickets List */}
        <div className="space-y-4">
          {filteredTickets.length > 0 ? (
            filteredTickets.map((ticket) => (
              <motion.div
                key={ticket._id || ticket.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-text-dark">{ticket.subject}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority || 'medium'}
                      </span>
                      <span className={`px-3 py-1 rounded text-sm font-semibold ${getStatusColor(ticket.status)}`}>
                        {ticket.status || 'New'}
                      </span>
                    </div>
                    <p className="text-text-light mb-3">{ticket.description}</p>
                    <div className="flex items-center gap-4 text-sm text-text-light">
                      <span>
                        <strong>User:</strong> {ticket.user?.name || 'Unknown'} ({ticket.user?.email || 'N/A'})
                      </span>
                      <span>•</span>
                      <span>
                        <strong>Category:</strong> {ticket.category || 'general'}
                      </span>
                      <span>•</span>
                      <span>
                        <strong>Created:</strong> {new Date(ticket.createdAt || ticket.created_at).toLocaleString()}
                      </span>
                    </div>
                    {ticket.adminRemark && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm font-semibold text-text-dark mb-1">Admin Remark:</p>
                        <p className="text-sm text-text-light">{ticket.adminRemark}</p>
                        {ticket.remarkUpdatedAt && (
                          <p className="text-xs text-text-light mt-1">
                            Updated: {new Date(ticket.remarkUpdatedAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-text-dark">Status:</label>
                    <select
                      value={ticket.status || 'new'}
                      onChange={(e) => handleStatusUpdate(ticket._id || ticket.id, e.target.value)}
                      disabled={updatingStatus === (ticket._id || ticket.id)}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue text-sm disabled:opacity-50"
                    >
                      <option value="new">New</option>
                      <option value="open">Open</option>
                      <option value="in-progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                    {updatingStatus === (ticket._id || ticket.id) && (
                      <Loader2 className="w-4 h-4 animate-spin text-primary-blue" />
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setSelectedTicket(ticket);
                      setRemark('');
                      setShowRemarkModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-light transition-colors text-sm"
                  >
                    <MessageSquare className="w-4 h-4" />
                    {ticket.adminRemark ? 'Update Remark' : 'Add Remark'}
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <Ticket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-text-light text-lg">No tickets found</p>
              {searchTerm && (
                <p className="text-text-light text-sm mt-2">Try adjusting your search or filter</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Remark Modal */}
      {showRemarkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6"
          >
            <h3 className="text-xl font-semibold text-text-dark mb-4">Add/Update Remark</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-text-dark mb-2">Ticket:</label>
              <p className="text-text-light">{selectedTicket?.subject}</p>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-text-dark mb-2">Remark:</label>
              <textarea
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                placeholder="Enter your remark or response..."
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRemarkModal(false);
                  setSelectedTicket(null);
                  setRemark('');
                }}
                disabled={addingRemark}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddRemark}
                disabled={addingRemark || !remark.trim()}
                className="flex-1 px-6 py-3 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {addingRemark ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Save Remark</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Tickets;

