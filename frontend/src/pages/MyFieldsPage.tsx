import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../components/AuthContext';
import { Field } from '../types';
import { FieldCard } from '../components/FieldCard';
import '../styles/FieldsList.css';

export const MyFieldsPage: React.FC = () => {
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyFields();
  }, []);

  const fetchMyFields = async () => {
    try {
      setLoading(true);
      const { data } = await api.getFieldsByAgent();
      setFields(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load your fields');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="container"><p>Loading...</p></div>;

  return (
    <div className="container">
      <h1>My Assigned Fields</h1>

      {error && <div className="error-message">{error}</div>}

      <div className="fields-grid">
        {fields.map((field) => (
          <FieldCard
            key={field.id}
            field={field}
            onClick={() => navigate(`/field/${field.id}`)}
          />
        ))}
      </div>

      {fields.length === 0 && (
        <div className="empty-state">
          <p>No fields assigned to you yet.</p>
        </div>
      )}
    </div>
  );
};
