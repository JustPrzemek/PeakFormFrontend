import React from 'react';
import { UserCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function ProfileContent() {
  const { user } = useAuth();

  return (
    <div className="profile-content">
      <div className="profile-header">
        <div className="profile-avatar">
          <UserCircle size={80} />
        </div>
        <div className="profile-info">
          <h2>{user?.username}</h2>
          <p>{user?.email}</p>
          <span className="role-badge">{user?.role}</span>
        </div>
      </div>

      <div className="profile-details">
        <h3>Personal Information</h3>
        <div className="details-grid">
          <div className="detail-item">
            <strong>Email:</strong>
            <span>{user?.email}</span>
          </div>
          <div className="detail-item">
            <strong>Username:</strong>
            <span>{user?.username}</span>
          </div>
          <div className="detail-item">
            <strong>Age:</strong>
            <span>{user?.age} years</span>
          </div>
          <div className="detail-item">
            <strong>Weight:</strong>
            <span>{user?.weight} kg</span>
          </div>
          <div className="detail-item">
            <strong>Height:</strong>
            <span>{user?.height} cm</span>
          </div>
          <div className="detail-item">
            <strong>Fitness Goal:</strong>
            <span>{user?.goal === 'reduction' ? 'Weight Loss' : user?.goal === 'bulk' ? 'Muscle Gain' : 'Maintenance'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}