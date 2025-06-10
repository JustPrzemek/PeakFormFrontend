import React from 'react';
import { Target, Weight, Ruler, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function DashboardContent() {
  const { user } = useAuth();

  return (
    <div className="dashboard-content">
      <div className="dashboard-header">
        <h1>Welcome back, {user?.username}!</h1>
        <p>Here's your fitness overview</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <Target size={24} />
          </div>
          <div className="stat-info">
            <h3>Current Goal</h3>
            <p>{user?.goal === 'reduction' ? 'Weight Loss' : user?.goal === 'bulk' ? 'Muscle Gain' : 'Maintenance'}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Weight size={24} />
          </div>
          <div className="stat-info">
            <h3>Weight</h3>
            <p>{user?.weight} kg</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Ruler size={24} />
          </div>
          <div className="stat-info">
            <h3>Height</h3>
            <p>{user?.height} cm</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Calendar size={24} />
          </div>
          <div className="stat-info">
            <h3>Age</h3>
            <p>{user?.age} years</p>
          </div>
        </div>
      </div>
    </div>
  );
}