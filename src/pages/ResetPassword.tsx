import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { publicApiClient } from '../api/client';

interface ValidateTokenResponse {
  valid: boolean;
  message: string;
}

interface ResetPasswordResponse {
  message: string;
  success: boolean;
}

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [validating, setValidating] = useState(true);

  useEffect(() => {
    console.log('Token from URL:', token); // Debug: Check if token is received
    
    if (!token) {
      setError('No reset token provided. Please request a new password reset link.');
      setValidating(false);
      return;
    }

    // Validate token
    const validateToken = async () => {
      try {
        const response = await publicApiClient.get<ValidateTokenResponse>(`/api/password-reset/validate-token?token=${token}`);
        if (response.valid) {
          setValidating(false);
        } else {
          setError('Reset link is invalid or has expired. Please request a new one.');
          setValidating(false);
        }
      } catch (err) {
        setError('Invalid or expired reset link. Please request a new one.');
        setValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setSubmitting(true);
    setError('');
    setMessage('');

    try {
      const response = await publicApiClient.post<ResetPasswordResponse>('/api/password-reset/confirm', {
        token,
        new_password: password
      });
      
      setSuccess(true);
      setMessage(response.message || 'Password reset successful!');
      
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      setError(err?.message || 'Failed to reset password');
    } finally {
      setSubmitting(false);
    }
  };

  if (validating) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5' }}>
        <Card style={{ width: '100%', maxWidth: 440 }}>
          <CardContent>
            <div style={{ textAlign: 'center', padding: 40 }}>
              <div>Validating reset link...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: '#f0f2f5' }}>
      <Card style={{ width: '100%', maxWidth: 440 }}>
        <CardHeader>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🔐</div>
            <h2 style={{ margin: 0 }}>Reset Password</h2>
            <p style={{ margin: '4px 0 0', color: '#6b7280' }}>
              Create a new password
            </p>
          </div>
        </CardHeader>

        <CardContent>
          {success ? (
            <div>
              <div style={{ padding: 16, background: '#d1fae5', borderRadius: 8, marginBottom: 16, color: '#065f46' }}>
                ✅ {message}
              </div>
              <div style={{ textAlign: 'center' }}>
                <p>Redirecting to login...</p>
                <Link to="/login">
                  <Button>Go to Login</Button>
                </Link>
              </div>
            </div>
          ) : error ? (
            <div>
              <div style={{ padding: 16, background: '#fee2e2', borderRadius: 8, marginBottom: 16, color: '#b91c1c' }}>
                ❌ {error}
              </div>
              <Link to="/forgot-password">
                <Button style={{ width: '100%' }}>Request New Reset Link</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gap: '16px' }}>
                <div>
                  <label htmlFor="password">New Password</label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                    placeholder="Enter new password (min 6 characters)"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword">Confirm New Password</label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your new password"
                    required
                  />
                </div>

                {error && (
                  <div style={{ color: '#b91c1c', background: '#fee2e2', padding: '10px 12px', borderRadius: 8 }}>
                    ❌ {error}
                  </div>
                )}

                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Resetting...' : 'Reset Password'}
                </Button>

                <div style={{ textAlign: 'center', marginTop: 16 }}>
                  <Link to="/login" style={{ color: '#4F46E5', textDecoration: 'none' }}>
                    ← Back to Login
                  </Link>
                </div>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;