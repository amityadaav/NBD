import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search, LifeBuoy, CheckCircle2, XCircle, Clock, Eye, RefreshCw, X,
  Sparkles, MessageSquare, AlertCircle, Filter, ChevronLeft, ChevronRight,
  Mail, User, Tag, Send, CalendarDays
} from "lucide-react";
import api from "../../services/api";
import "./AdminSupportTickets.css";

const STATUS_LABELS = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
};

const STATUS_CLASS = {
  open: "ticket-open",
  in_progress: "ticket-progress",
  resolved: "ticket-resolved",
};

const STAT_META = [
  { key: "total", label: "Total Tickets", icon: LifeBuoy, tone: "teal" },
  { key: "open", label: "Open", icon: AlertCircle, tone: "red" },
  { key: "in_progress", label: "In Progress", icon: Clock, tone: "amber" },
  { key: "resolved", label: "Resolved", icon: CheckCircle2, tone: "green" },
];

const getErrorMessage = (error, fallback) => {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.response?.status === 401) return "Session expired. Please log in again.";
  if (error.response?.status === 403) return "Access denied. Super Admin only.";
  if (error.code === "ERR_NETWORK") return "Cannot connect to the backend.";
  return error.message || fallback;
};

const formatDate = (value) => {
  if (!value) return "N/A";
  const date = new Date(value);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  });
};

const getInitials = (name = "") =>
  name.split(" ").filter(Boolean).slice(0, 2).map((n) => n[0]).join("").toUpperCase() || "?";

function AdminSupportTickets() {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({ open: 0, in_progress: 0, resolved: 0 });
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Details Modal State
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [newStatus, setNewStatus] = useState("");

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setQuery(search.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchTickets = useCallback(async (background = false) => {
    if (background) setRefreshing(true);
    else setLoading(true);
    setError("");

    try {
      const { data } = await api.get("/admin/support-tickets", {
        params: { status: filter, search: query, page, limit: 20 },
      });
      
      setTickets(data.tickets || []);
      
      // Calculate total from stats
      const s = data.stats || { open: 0, in_progress: 0, resolved: 0 };
      const total = s.open + s.in_progress + s.resolved;
      setStats({ ...s, total });

      setPagination(data.pagination || { page: 1, totalPages: 1, total });
    } catch (err) {
      setError(getErrorMessage(err, "Unable to fetch support tickets."));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter, query, page]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const hasFilters = Boolean(query) || filter !== "";

  const resetFilters = () => {
    setSearch("");
    setFilter("");
    setPage(1);
  };

  // Open details modal
  const viewTicket = async (ticket) => {
    setError("");
    setDetailsLoading(true);
    setSelectedTicket({ ...ticket, _loading: true });
    setReplyMessage("");
    setNewStatus(ticket.status);
    
    try {
      const { data } = await api.get(`/admin/support-tickets/${ticket._id}`);
      setSelectedTicket(data.ticket);
    } catch (err) {
      setError(getErrorMessage(err, "Unable to load ticket details."));
      setSelectedTicket(null);
    } finally {
      setDetailsLoading(false);
    }
  };

  // Reply to ticket
  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim() || !selectedTicket) return;

    setUpdatingId(selectedTicket._id);
    setError("");
    setNotice("");

    try {
      const { data } = await api.post(`/admin/support-tickets/${selectedTicket._id}/reply`, {
        message: replyMessage.trim(),
      });
      setSelectedTicket(data.ticket);
      setReplyMessage("");
      setNotice("Reply sent successfully.");
      await fetchTickets(true); // refresh list in background
    } catch (err) {
      setError(getErrorMessage(err, "Failed to send reply."));
    } finally {
      setUpdatingId(null);
    }
  };

  // Change Status
  const handleStatusChange = async (status) => {
    if (!selectedTicket || status === selectedTicket.status) return;

    setUpdatingId(selectedTicket._id);
    setError("");
    setNotice("");

    try {
      const { data } = await api.patch(`/admin/support-tickets/${selectedTicket._id}/status`, {
        status,
      });
      setSelectedTicket(data.ticket);
      setNewStatus(status);
      setNotice("Status updated successfully.");
      await fetchTickets(true);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to update status."));
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="admin-tickets-page">
      {/* ---------- Hero header ---------- */}
      <div className="at-hero">
        <div className="at-hero-glow" aria-hidden="true" />
        <div className="at-hero-main">
          <div className="at-hero-icon">
            <LifeBuoy size={22} />
          </div>
          <div className="at-hero-text">
            <span className="at-eyebrow">
              <Sparkles size={11} /> Administration
            </span>
            <h1>Support Tickets</h1>
            <p>
              Manage and resolve user inquiries.
              {stats.open > 0 && (
                <span className="at-hero-highlight">
                  <AlertCircle size={12} /> {stats.open} open
                </span>
              )}
            </p>
          </div>
        </div>

        <button
          className="at-hero-refresh"
          onClick={() => fetchTickets(true)}
          disabled={loading || refreshing || updatingId !== null}
        >
          <RefreshCw size={15} className={refreshing ? "at-spin" : ""} />
          {refreshing ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="at-alert at-error" role="alert">
          <AlertCircle size={15} /> <span>{error}</span>
          <button type="button" className="at-alert-retry" onClick={() => fetchTickets()} disabled={loading}>
            Retry
          </button>
        </div>
      )}
      {notice && (
        <div className="at-alert at-success" role="status">
          <CheckCircle2 size={15} /> <span>{notice}</span>
        </div>
      )}

      {/* ---------- Stats ---------- */}
      <div className="at-stats">
        {STAT_META.map(({ key, label, icon: Icon, tone }, i) => (
          <div 
            key={key} 
            className={`at-stat-card ${filter === key ? "at-stat-active" : ""}`} 
            style={{ "--stagger": `${i * 40}ms` }}
            onClick={() => { setFilter(key === "total" ? "" : key); setPage(1); }}
          >
            <div className={`at-stat-icon at-icon-${tone}`}>
              <Icon size={18} />
            </div>
            <div className="at-stat-body">
              <p>{label}</p>
              <h2>{loading ? "…" : stats[key] || 0}</h2>
            </div>
          </div>
        ))}
      </div>

      {/* ---------- Card ---------- */}
      <div className="at-card">
        <div className="at-toolbar">
          <div className="at-search">
            <Search size={17} />
            <input
              type="text"
              placeholder="Search by ticket #, email, subject…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search tickets"
            />
            {search && (
              <button type="button" className="at-search-clear" onClick={() => setSearch("")} aria-label="Clear search">
                <X size={13} />
              </button>
            )}
          </div>

          <div className="at-toolbar-right">
            <div className="at-filter-wrap">
              <Filter size={14} className="at-filter-icon" />
              <select
                value={filter}
                onChange={(e) => { setFilter(e.target.value); setPage(1); }}
                aria-label="Filter tickets by status"
              >
                <option value="">All Status</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            {hasFilters && (
              <button type="button" className="at-clear-filters" onClick={resetFilters}>
                <X size={12} /> Clear
              </button>
            )}
          </div>
        </div>

        <div className="at-table-wrapper">
          <table className="at-table">
            <thead>
              <tr>
                <th>Ticket Info</th>
                <th>User</th>
                <th>Category</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="at-skeleton-row">
                    <td colSpan="6"><div className="at-skeleton-line" /></td>
                  </tr>
                ))
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan="6" className="at-empty">
                    <div className="at-empty-state">
                      <LifeBuoy size={30} />
                      <p>No tickets found</p>
                      <small>
                        {hasFilters
                          ? "Try clearing your search or filter."
                          : "Support requests will appear here."}
                      </small>
                    </div>
                  </td>
                </tr>
              ) : (
                tickets.map((ticket) => (
                  <tr key={ticket._id}>
                    <td>
                      <div className="at-ticket-cell">
                        <div className="at-ticket-icon">
                          <MessageSquare size={16} />
                        </div>
                        <div className="at-ticket-meta">
                          <strong>#{ticket.ticketNumber}</strong>
                          <small>{ticket.subject}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="at-user-cell">
                        <div className="at-user-avatar">{getInitials(ticket.name)}</div>
                        <div>
                          <strong>{ticket.name}</strong>
                          <small>{ticket.email}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="at-category-badge">
                        {ticket.category}
                      </span>
                    </td>
                    <td>
                      <span className={`at-status ${STATUS_CLASS[ticket.status]}`}>
                        {STATUS_LABELS[ticket.status]}
                      </span>
                    </td>
                    <td>
                      <span className="at-date-cell">
                        {formatDate(ticket.createdAt).split(",")[0]}
                      </span>
                    </td>
                    <td>
                      <div className="at-actions">
                        <button
                          type="button"
                          className="at-view-btn"
                          title="View ticket"
                          onClick={() => viewTicket(ticket)}
                        >
                          <Eye size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="at-footer">
          <span>
            Showing <strong>{tickets.length}</strong> of <strong>{pagination.total}</strong> tickets
            {hasFilters && <span className="at-footer-hint"> · filters active</span>}
          </span>

          {pagination.totalPages > 1 && (
            <div className="at-pager">
              <button
                type="button"
                className="at-pager-btn"
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft size={14} /> Prev
              </button>
              <span className="at-pager-label">
                Page <strong>{pagination.page}</strong> of {pagination.totalPages || 1}
              </span>
              <button
                type="button"
                className="at-pager-btn"
                disabled={page >= pagination.totalPages || loading}
                onClick={() => setPage((p) => p + 1)}
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ---------- Details Modal ---------- */}
      {selectedTicket && (
        <div className="at-modal-backdrop" onClick={() => !updatingId && setSelectedTicket(null)}>
          <section
            className="at-modal"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="at-modal-hero">
              <div className="at-modal-hero-top">
                <div>
                  <span className="at-modal-eyebrow">Ticket #{selectedTicket.ticketNumber}</span>
                  <h3>{selectedTicket.subject}</h3>
                </div>
                <button
                  className="at-close-btn"
                  onClick={() => setSelectedTicket(null)}
                  aria-label="Close details"
                  disabled={updatingId !== null}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="at-modal-hero-body">
                <span className={`at-status ${STATUS_CLASS[selectedTicket.status]}`}>
                  {STATUS_LABELS[selectedTicket.status]}
                </span>
                <div className="at-modal-hero-stats">
                  <span className="at-hero-stat">
                    <User size={12} />
                    <strong>{selectedTicket.name}</strong>
                  </span>
                  <span className="at-hero-stat">
                    <Mail size={12} />
                    <strong>{selectedTicket.email}</strong>
                  </span>
                  <span className="at-hero-stat">
                    <Tag size={12} />
                    <strong style={{ textTransform: "capitalize" }}>{selectedTicket.category}</strong>
                  </span>
                </div>
              </div>
            </div>

            <div className="at-modal-body">
              {detailsLoading ? (
                <div className="at-details-loading">
                  <RefreshCw size={18} className="at-spin" /> Loading details…
                </div>
              ) : (
                <>
                  {/* Original Message */}
                  <div className="at-message-box">
                    <div className="at-message-header">
                      <strong>Original Message</strong>
                      <small>{formatDate(selectedTicket.createdAt)}</small>
                    </div>
                    <p>{selectedTicket.message}</p>
                  </div>

                  {/* Replies */}
                  {selectedTicket.replies && selectedTicket.replies.length > 0 && (
                    <div className="at-replies-section">
                      <h5>Conversation History</h5>
                      <div className="at-replies-list">
                        {selectedTicket.replies.map((reply, idx) => (
                          <div key={idx} className="at-reply-item">
                            <div className="at-reply-header">
                              <strong>{reply.authorName}</strong>
                              <small>{formatDate(reply.createdAt)}</small>
                            </div>
                            <p>{reply.message}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Status Change Form */}
                  <div className="at-status-control">
                    <label>Update Status:</label>
                    <select
                      value={newStatus}
                      onChange={(e) => {
                        setNewStatus(e.target.value);
                        handleStatusChange(e.target.value);
                      }}
                      disabled={updatingId !== null}
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>
                </>
              )}
            </div>

            {/* Reply Form (Footer) */}
            {!detailsLoading && (
              <div className="at-modal-actions" style={{ display: "block" }}>
                <form onSubmit={handleReply} className="at-reply-form">
                  <textarea
                    placeholder="Type your reply to the user..."
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    disabled={updatingId !== null || selectedTicket.status === "resolved"}
                    rows={3}
                  />
                  <div className="at-reply-actions">
                    <small className="at-reply-note">
                      {selectedTicket.status === "resolved" 
                        ? "Change status to Open or In Progress to reply." 
                        : "Replies will be visible to the user."}
                    </small>
                    <button
                      type="submit"
                      className="at-send-btn"
                      disabled={updatingId !== null || !replyMessage.trim() || selectedTicket.status === "resolved"}
                    >
                      {updatingId !== null ? <RefreshCw size={14} className="at-spin" /> : <Send size={14} />}
                      {updatingId !== null ? "Sending…" : "Send Reply"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

export default AdminSupportTickets;