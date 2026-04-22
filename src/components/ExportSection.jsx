// ============================================================
// components/ExportSection.jsx
// ============================================================
// Shows export buttons so users can download their data.
// Three formats: JSON, CSV, Markdown
// Clicking a button opens a new browser tab that triggers download.
// ============================================================

import React, { useState } from 'react';
import { exportWeatherData } from '../services/api';

const ExportSection = ({ recordCount }) => {
  const [exporting, setExporting] = useState(null);

  const handleExport = async (format) => {
    setExporting(format);
    try {
      await exportWeatherData(format);
    } finally {
      // Give a brief visual feedback before resetting
      setTimeout(() => setExporting(null), 1500);
    }
  };

  if (recordCount === 0) return null;

  return (
    <div className="export-section card">
      <p className="section-title">⬇️ Export Data ({recordCount} records)</p>

      <div className="export-buttons">

        <button
          className="btn btn-secondary"
          onClick={() => handleExport('json')}
          disabled={!!exporting}
          title="Download as JSON file"
        >
          {exporting === 'json' ? '⏳ Exporting...' : '{ } Export JSON'}
        </button>

        <button
          className="btn btn-secondary"
          onClick={() => handleExport('csv')}
          disabled={!!exporting}
          title="Download as CSV spreadsheet"
        >
          {exporting === 'csv' ? '⏳ Exporting...' : '📊 Export CSV'}
        </button>

        <button
          className="btn btn-secondary"
          onClick={() => handleExport('markdown')}
          disabled={!!exporting}
          title="Download as Markdown table"
        >
          {exporting === 'markdown' ? '⏳ Exporting...' : '📝 Export Markdown'}
        </button>

        <button
          className="btn btn-secondary"
          onClick={() => handleExport('xml')}
          disabled={!!exporting}
          title="Download as XML file"
        >
          {exporting === 'xml' ? '⏳ Exporting...' : '🗂️ Export XML'}
        </button>

        <button
          className="btn btn-secondary"
          onClick={() => handleExport('pdf')}
          disabled={!!exporting}
          title="Download as PDF file"
        >
          {exporting === 'pdf' ? '⏳ Exporting...' : '📄 Export PDF'}
        </button>

      </div>

      <p style={{
        marginTop: '12px',
        fontSize: '0.72rem',
        color: 'var(--text-muted)',
        fontFamily: 'var(--font-mono)'
      }}>
        Downloads all {recordCount} saved weather records from the database.
      </p>
    </div>
  );
};

export default ExportSection;
