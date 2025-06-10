import React, { useState, useEffect } from 'react';
import { Mail } from 'lucide-react';
import { AuthService } from '../../services/AuthService';

export function EmailVerification() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
      AuthService.verifyEmail(token)
        .then(() => setStatus('success'))
        .catch(() => setStatus('error'));
    } else {
      setStatus('error');
    }
  }, []);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon">
            <Mail size={32} />
          </div>
          {status === 'loading' && (
            <>
              <h1>Verifying Email</h1>
              <p>Please wait while we verify your email...</p>
            </>
          )}
          {status === 'success' && (
            <>
              <h1>Email Verified!</h1>
              <p>Your email has been successfully verified. You can now log in.</p>
              <button 
                className="auth-button" 
                onClick={() => window.location.href = '/'}
              >
                Go to Login
              </button>
            </>
          )}
          {status === 'error' && (
            <>
              <h1>Verification Failed</h1>
              <p>The verification link is invalid or has expired.</p>
              <button 
                className="auth-button" 
                onClick={() => window.location.href = '/'}
              >
                Back to Login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}