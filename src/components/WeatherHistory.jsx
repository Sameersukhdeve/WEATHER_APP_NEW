// ============================================================
// components/WeatherHistory.jsx
// ============================================================
// Shows all saved weather records from the database in a table.
// Features:
//   - Search/filter by location name
//   - Inline editing of location and date range
//   - Delete individual records
//   - Click a row to view its weather data again
// ============================================================

import React, { useState } from 'react';

// Format a date for display
const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });
};

const WeatherHistory = ({ records, onDelete, onEdit, onLoadRecords }) => {
  // Which record ID is currently being edited (null = none)
  const [editingId, setEditingId]         = useState(null);
  // The values in the edit form
  const [editForm, setEditForm]           = useState({});
  // Search text to filter the table
  const [searchText, setSearchText]       = useState('');
  // Track which deletes are in progress
  const [deletingId, setDeletingId]       = useState(null);
  // Track save in progress
  const [savingId, setSavingId]           = useState(null);

  // ---- Edit helpers ----

  // Called when user clicks the "Edit" button on a row
  const startEdit = (record) => {
    setEditingId(record.id);
    setEditForm({
      location:        record.location,
      date_range_start: record.date_range_start
        ? record.date_range_start.split('T')[0]  // strip time part if present
        : '',
      date_range_end: record.date_range_end
        ? record.date_range_end.split('T')[0]
        : ''
    });
  };

  // Called when user clicks "Cancel" on an edit row
  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  // Called when user clicks "Save" on an edit row
  const saveEdit = async (id) => {
    setSavingId(id);
    try {
      await onEdit(id, {
        location:         editForm.location,
        date_range_start: editForm.date_range_start || undefined,
        date_range_end:   editForm.date_range_end   || undefined
      });
      setEditingId(null);
    } catch {
      // error is handled in the hook
    } finally {
      setSavingId(null);
    }
  };

  // ---- Delete helper ----
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this weather record? This cannot be undone.')) return;
    setDeletingId(id);
    await onDelete(id);
    setDeletingId(null);
  };

  // ---- Filter records by search text ----
  const filteredRecords = records.filter(r =>
    r.location.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="history-section card">
      <p className="section-title">📋 Search History ({records.length} records)</p>

      {/* Search + Refresh controls */}
      <div className="history-controls">
        <input
          type="text"
          className="history-search"
          placeholder="Filter by location..."
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
        />
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => onLoadRecords()}
          title="Refresh records from database"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Table or empty state */}
      {filteredRecords.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🌤️</div>
          <p className="empty-text">
            {records.length === 0
              ? 'No weather searches yet. Search a location above to get started!'
              : `No records match "${searchText}"`}
          </p>
        </div>
      ) : (
        <div className="records-table-wrapper">
          <table className="records-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Location</th>
                <th>Temp</th>
                <th>Humidity</th>
                <th>Wind</th>
                <th>Condition</th>
                <th>Date Range</th>
                <th>Saved On</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map(record => (
                <tr key={record.id}>
                  <td style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                    {record.id}
                  </td>

                  {/* Location — editable */}
                  <td>
                    {editingId === record.id ? (
                      <input
                        type="text"
                        className="edit-input"
                        value={editForm.location}
                        onChange={e => setEditForm(f => ({ ...f, location: e.target.value }))}
                        placeholder="New location..."
                      />
                    ) : (
                      <strong>{record.location}</strong>
                    )}
                    {record.country && (
                      <span style={{ marginLeft: 6 }}>
                        <span className="badge badge-blue">{record.country}</span>
                      </span>
                    )}
                  </td>

                  {/* Temperature */}
                  <td className="temp-cell">
                    {record.temperature !== null
                      ? `${Math.round(record.temperature)}°C`
                      : '—'}
                  </td>

                  {/* Humidity */}
                  <td>{record.humidity !== null ? `${record.humidity}%` : '—'}</td>

                  {/* Wind */}
                  <td>{record.wind_speed !== null ? `${record.wind_speed} m/s` : '—'}</td>

                  {/* Condition */}
                  <td style={{ textTransform: 'capitalize', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {record.weather_description || '—'}
                  </td>

                  {/* Date range — editable */}
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {editingId === record.id ? (
                      <div style={{ display: 'flex', gap: 6, flexDirection: 'column' }}>
                        <input
                          type="date"
                          className="date-input"
                          style={{ width: '140px', fontSize: '0.75rem', padding: '4px 8px' }}
                          value={editForm.date_range_start}
                          onChange={e => setEditForm(f => ({ ...f, date_range_start: e.target.value }))}
                        />
                        <input
                          type="date"
                          className="date-input"
                          style={{ width: '140px', fontSize: '0.75rem', padding: '4px 8px' }}
                          value={editForm.date_range_end}
                          onChange={e => setEditForm(f => ({ ...f, date_range_end: e.target.value }))}
                        />
                      </div>
                    ) : (
                      record.date_range_start
                        ? `${formatDate(record.date_range_start)} → ${formatDate(record.date_range_end)}`
                        : '—'
                    )}
                  </td>

                  {/* Created at */}
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {formatDate(record.created_at)}
                  </td>

                  {/* Actions */}
                  <td>
                    <div className="actions-cell">
                      {editingId === record.id ? (
                        <>
                          {/* Save button */}
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => saveEdit(record.id)}
                            disabled={savingId === record.id || !editForm.location?.trim()}
                          >
                            {savingId === record.id ? '⏳' : '💾'} Save
                          </button>
                          {/* Cancel button */}
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={cancelEdit}
                          >
                            ✕ Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          {/* Edit button */}
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => startEdit(record)}
                            title="Edit this record"
                          >
                            ✏️ Edit
                          </button>
                          {/* Delete button */}
                          <button
                            className="btn btn-danger"
                            onClick={() => handleDelete(record.id)}
                            disabled={deletingId === record.id}
                            title="Delete this record"
                          >
                            {deletingId === record.id ? '⏳' : '🗑️'}
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default WeatherHistory;
