import React from 'react';
import { SearchX, Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: 'search' | 'inbox';
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon = 'inbox',
}) => {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        {icon === 'search' ? <SearchX size={48} /> : <Inbox size={48} />}
      </div>
      <h3 className="empty-title">{title}</h3>
      <p className="empty-description">{description}</p>
      {actionLabel && onAction && (
        <button className="btn-secondary" onClick={onAction} style={{ marginTop: '12px' }}>
          {actionLabel}
        </button>
      )}
    </div>
  );
};
