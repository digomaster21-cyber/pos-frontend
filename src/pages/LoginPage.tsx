import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { authApi } from '../api/auth';
import { storage } from '../utils/storage';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, loading: authLoading } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Registration form state
  const [companyName, setCompanyName] = useState('');
  const [regUsername, setRegUsername] = useState(''); // ADDED: Username field
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const from =
    (location.state as { from?: { pathname?: string } } | undefined)?.from
      ?.pathname || '/dashboard';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (submitting || authLoading) return;

    setError('');
    setSubmitting(true);

    try {
      await login(username, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err?.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    if (regPassword !== confirmPassword) {
      setError('Passwords do not match');
      setSubmitting(false);
      return;
    }

    if (!regUsername.trim()) {
      setError('Username is required');
      setSubmitting(false);
      return;
    }

    try {
      const response = await authApi.registerCompany({
        company_name: companyName,
        email: email,
        phone: phone,
        password: regPassword,
        username: regUsername  // Use the user-provided username
      });

      // Auto login after registration
      storage.setToken(response.access_token);
      storage.setCompanyId(response.company_id);
      storage.setBranchId(response.branch_id);
      
      // Refresh auth context
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (!authLoading && isAuthenticated) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        background: '#f0f2f5',
      }}
    >
      <Card style={{ width: '100%', maxWidth: 480 }}>
        <CardHeader>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🏪</div>
            <h2 style={{ margin: 0 }}>POS System</h2>
            <p style={{ margin: '4px 0 0', color: '#6b7280' }}>
              {isLogin ? 'Sign in to your account' : 'Start your 30-day free trial'}
            </p>
          </div>
        </CardHeader>

        <CardContent>
          {/* Toggle between Login and Register */}
          <div style={{ display: 'flex', marginBottom: 24, borderBottom: '1px solid #e5e7eb' }}>
            <button
              onClick={() => { setIsLogin(true); setError(''); }}
              style={{
                flex: 1,
                padding: '8px 16px',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontWeight: isLogin ? 600 : 400,
                color: isLogin ? '#2563eb' : '#6b7280',
                borderBottom: isLogin ? '2px solid #2563eb' : 'none',
              }}
            >
              Login
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(''); }}
              style={{
                flex: 1,
                padding: '8px 16px',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontWeight: !isLogin ? 600 : 400,
                color: !isLogin ? '#2563eb' : '#6b7280',
                borderBottom: !isLogin ? '2px solid #2563eb' : 'none',
              }}
            >
              Register Business
            </button>
          </div>

          {isLogin ? (
            // LOGIN FORM
            <form onSubmit={handleLogin}>
              <div style={{ display: 'grid', gap: '16px' }}>
                <div>
                  <label htmlFor="username">Username</label>
                  <Input
                    id="username"
                    name="username"
                    autoComplete="username"
                    value={username}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setUsername(e.target.value)
                    }
                    placeholder="Enter username"
                    disabled={submitting || authLoading}
                  />
                </div>

                <div>
                  <label htmlFor="password">Password</label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setPassword(e.target.value)
                    }
                    placeholder="Enter password"
                    disabled={submitting || authLoading}
                  />
                </div>

                {/* Forgot Password Link */}
                <div style={{ textAlign: 'right', marginTop: '-8px' }}>
                  <Link 
                    to="/forgot-password" 
                    style={{ 
                      color: '#4F46E5', 
                      textDecoration: 'none',
                      fontSize: '14px'
                    }}
                  >
                    Forgot password?
                  </Link>
                </div>

                {error ? (
                  <div
                    style={{
                      color: '#b91c1c',
                      background: '#fee2e2',
                      padding: '10px 12px',
                      borderRadius: 8,
                    }}
                  >
                    {error}
                  </div>
                ) : null}

                <Button type="submit" disabled={submitting || authLoading}>
                  {submitting ? 'Logging in...' : 'Login'}
                </Button>
              </div>
            </form>
          ) : (
            // REGISTRATION FORM
            <form onSubmit={handleRegister}>
              <div style={{ display: 'grid', gap: '16px' }}>
                <div>
                  <label htmlFor="company_name">Business Name *</label>
                  <Input
                    id="company_name"
                    value={companyName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setCompanyName(e.target.value)
                    }
                    placeholder="e.g., John's Supermarket"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="reg_username">Username *</label>
                  <Input
                    id="reg_username"
                    value={regUsername}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setRegUsername(e.target.value)
                    }
                    placeholder="Choose a username"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email">Email Address *</label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEmail(e.target.value)
                    }
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="phone">Phone Number</label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setPhone(e.target.value)
                    }
                    placeholder="e.g., 061567655"
                  />
                </div>

                <div>
                  <label htmlFor="reg_password">Password *</label>
                  <Input
                    id="reg_password"
                    type="password"
                    value={regPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setRegPassword(e.target.value)
                    }
                    required
                  />
                </div>

                <div>
                  <label htmlFor="confirm_password">Confirm Password *</label>
                  <Input
                    id="confirm_password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setConfirmPassword(e.target.value)
                    }
                    required
                  />
                </div>

                <div style={{ fontSize: 12, color: '#6b7280', background: '#f3f4f6', padding: 12, borderRadius: 8 }}>
                  <strong>🎉 Free Trial Includes:</strong>
                  <ul style={{ margin: '8px 0 0', paddingLeft: 20 }}>
                    <li>30-day free trial</li>
                    <li>All features unlocked</li>
                    <li>Up to 3 branches</li>
                    <li>No credit card required</li>
                  </ul>
                </div>

                {error ? (
                  <div
                    style={{
                      color: '#b91c1c',
                      background: '#fee2e2',
                      padding: '10px 12px',
                      borderRadius: 8,
                    }}
                  >
                    {error}
                  </div>
                ) : null}

                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Creating Account...' : 'Start Free Trial'}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;