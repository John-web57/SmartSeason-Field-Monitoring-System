import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Field, FieldStage, FieldStatus } from '../types';
import { FieldCard } from '../components/FieldCard';
import '../styles/FieldsList.css';

export const SearchFieldsPage: React.FC = () => {
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    cropType: '',
    status: '',
    stage: ''
  });
  const navigate = useNavigate();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data } = await api.searchFields(searchQuery, filters);
      setFields(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilters({ cropType: '', status: '', stage: '' });
    setFields([]);
  };

  return (
    <div className="container">
      <h1>Search & Filter Fields</h1>

      <form onSubmit={handleSearch} className="search-form">
        <div className="search-input-group">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by field name, description, or crop type..."
          />
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        <div className="filters-grid">
          <div className="form-group">
            <label>Crop Type</label>
            <select
              value={filters.cropType}
              onChange={(e) => setFilters({ ...filters, cropType: e.target.value })}
            >
              <option value="">All Crops</option>
              <option value="Corn">Corn</option>
              <option value="Soybeans">Soybeans</option>
              <option value="Wheat">Wheat</option>
              <option value="Barley">Barley</option>
              <option value="Oats">Oats</option>
            </select>
          </div>

          <div className="form-group">
            <label>Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">All Statuses</option>
              {Object.values(FieldStatus).map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Stage</label>
            <select
              value={filters.stage}
              onChange={(e) => setFilters({ ...filters, stage: e.target.value })}
            >
              <option value="">All Stages</option>
              {Object.values(FieldStage).map((stage) => (
                <option key={stage} value={stage}>
                  {stage.charAt(0).toUpperCase() + stage.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button type="button" className="btn-secondary" onClick={clearFilters}>
          Clear Filters
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}

      {fields.length > 0 && (
        <div className="search-results">
          <p className="results-count">Found {fields.length} field(s)</p>
          <div className="fields-grid">
            {fields.map((field) => (
              <FieldCard
                key={field.id}
                field={field}
                onClick={() => navigate(`/field/${field.id}`)}
              />
            ))}
          </div>
        </div>
      )}

      {!loading && fields.length === 0 && searchQuery && (
        <div className="empty-state">
          <p>No fields found matching your search criteria.</p>
        </div>
      )}

      {!loading && fields.length === 0 && !searchQuery && (
        <div className="empty-state">
          <p>Enter a search term or apply filters to find fields.</p>
        </div>
      )}
    </div>
  );
};
