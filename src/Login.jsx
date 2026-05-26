import React from 'react'
import { Container, Form } from 'react-bootstrap'
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
} from 'firebase/auth'
import { auth, googleProvider } from './firebase/auth.js'

import './Login.css'
import Img from './Home/img.svg'

class Login extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            mode:     'login',  // 'login' | 'register'
            email:    '',
            password: '',
            error:    null,
            loading:  false,
        };

        this.onSubmit      = this.onSubmit.bind(this);
        this.onGoogleLogin = this.onGoogleLogin.bind(this);
    }

    async onSubmit(e) {
        e.preventDefault();
        this.setState({ error: null, loading: true });

        const { email, password, mode } = this.state;

        try {
            if (mode === 'login') {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
            }
            // onAuthSuccess is called by the parent via onAuthStateChanged —
            // no explicit call needed here; Firebase will update auth state.
        } catch (err) {
            this.setState({ error: this.friendlyError(err.code), loading: false });
        }
    }

    async onGoogleLogin() {
        this.setState({ error: null, loading: true });
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (err) {
            this.setState({ error: this.friendlyError(err.code), loading: false });
        }
    }

    friendlyError(code) {
        const map = {
            'auth/invalid-email':           'That email address looks incorrect.',
            'auth/user-not-found':          'No account found with that email.',
            'auth/wrong-password':          'Incorrect password.',
            'auth/email-already-in-use':    'An account with that email already exists.',
            'auth/weak-password':           'Password must be at least 6 characters.',
            'auth/too-many-requests':       'Too many attempts. Please wait a moment.',
            'auth/popup-closed-by-user':    'Google sign-in was cancelled.',
        };
        return map[code] ?? 'Something went wrong. Please try again.';
    }

    toggleMode() {
        this.setState(prev => ({
            mode:     prev.mode === 'login' ? 'register' : 'login',
            error:    null,
            password: '',
        }));
    }

    render() {
        const { mode, email, password, error, loading } = this.state;
        const isLogin = mode === 'login';

        return (
            <Container className="login-page-wrap">
                <div className="parchment login-parchment">

                    <div className="corner-ornament tl"><i className="fas fa-crown" /></div>
                    <div className="corner-ornament tr"><i className="fas fa-crown" /></div>
                    <div className="corner-ornament bl"><i className="fas fa-fire-flame-curved" /></div>
                    <div className="corner-ornament br"><i className="fas fa-fire-flame-curved" /></div>

                    <div className="text-center mb-2">
                        <img src={Img} alt="The Forge" />
                    </div>

                    <h1 className="parchment-title">The Forge</h1>
                    <p className="parchment-subtitle">
                        {isLogin ? 'Identify Thyself' : 'Forge Thine Account'}
                    </p>

                    <div className="ink-divider">
                        <i className="fas fa-hammer" />
                        <i className="fas fa-shield-halved" />
                        <i className="fas fa-hammer fa-flip-horizontal" />
                    </div>

                    {/* ── Error banner ── */}
                    {error && (
                        <div className="alert-parchment">
                            <i className="fas fa-exclamation-circle fa-xs me-1" />
                            {error}
                        </div>
                    )}

                    <Form onSubmit={this.onSubmit}>

                        <Form.Group className="mb-4" controlId="loginEmail">
                            <Form.Label className="ink-label">
                                <i className="fas fa-envelope fa-xs me-1" /> Email
                            </Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="your@email.com"
                                value={email}
                                onChange={(e) => this.setState({ email: e.target.value })}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-4" controlId="loginPassword">
                            <Form.Label className="ink-label">
                                <i className="fas fa-key fa-xs me-1" /> Password
                            </Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => this.setState({ password: e.target.value })}
                                required
                            />
                        </Form.Group>

                        {/* ── Wax seal submit ── */}
                        <div className="wax-seal-wrap">
                            <button type="submit" className="wax-seal-btn" disabled={loading}>
                                {loading
                                    ? <i className="fas fa-spinner fa-spin" />
                                    : <i className="fas fa-stamp" />
                                }
                                {isLogin ? 'Enter' : 'Register'}
                            </button>
                        </div>

                    </Form>

                    {/* ── Divider ── */}
                    <div className="login-or-divider">
                        <span>or</span>
                    </div>

                    {/* ── Google button ── */}
                    <div className="text-center">
                        <button
                            type="button"
                            className="google-btn"
                            onClick={this.onGoogleLogin}
                            disabled={loading}
                        >
                            <svg className="google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                            </svg>
                            Continue with Google
                        </button>
                    </div>

                    {/* ── Toggle login/register ── */}
                    <p className="login-toggle">
                        {isLogin ? 'New to The Forge?' : 'Already have an account?'}
                        {' '}
                        <button
                            type="button"
                            className="login-toggle-btn"
                            onClick={() => this.toggleMode()}
                        >
                            {isLogin ? 'Create one' : 'Sign in'}
                        </button>
                    </p>

                </div>
            </Container>
        );
    }
}

export default Login;
