import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { publicApiClient } from '../api/client';

interface ForgotPasswordResponse {
  message: string;
  success: boolean;
}

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setMessage('');

    try {
      const response = await publicApiClient.post<ForgotPasswordResponse>('/api/password-reset/request', { email });
      setSuccess(true);
      setMessage(response.message || 'Password reset link sent to your email');
      
      // If email is not configured, the response contains the token
      if (response.message && response.message.includes('Reset token')) {
        console.log('Reset token:', response.message);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to send reset link');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: '#f0f2f5' }}>
      <Card style={{ width: '100%', maxWidth: 440 }}>
        <CardHeader>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🔐</div>
            <h2 style={{ margin: 0 }}>Forgot Password?</h2>
            <p style={{ margin: '4px 0 0', color: '#6b7280' }}>
              Enter your email to reset your password
            </p>
          </div>
        </CardHeader>

        <CardContent>
          {success ? (
            <div>
              <div style={{ padding: 16, background: '#d1fae5', borderRadius: 8, marginBottom: 16, color: '#065f46' }}>
                ✅ {message}
              </div>
              <Link to="/login">
                <Button style={{ width: '100%' }}>Back to Login</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gap: '16px' }}>
                <div>
                  <label htmlFor="email">Email Address</label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    required
                  />
                </div>

                {error && (
                  <div style={{ color: '#b91c1c', background: '#fee2e2', padding: '10px 12px', borderRadius: 8 }}>
                    ❌ {error}
                  </div>
                )}

                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Sending...' : 'Send Reset Link'}
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

export default ForgotPassword;