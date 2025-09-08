import './css/LoginView.css';
//import { useNavigate } from 'react-router-dom';

const LoginView = () => {
    //const navigate = useNavigate();

    const handleLogin = (event) => {
        event.preventDefault();
        // Perform login logic here
        // Hardcoded for demonstration purposes
        const username = event.target.username.value;
        const password = event.target.password.value;
        console.log('Logging in with', { username, password });
        // On successful login, navigate to the desired route
        //navigate('/dashboard');
    };

    return (
        <div className="login-container">
            {/* Left side */}
            <div className="login-left">
                <div className="login-logo"><a href="/home" className="login-logo-link">🅱️</a></div>
                <div className="login-title">Bruh Web</div>
                <div className="login-desc">
                    Hệ thống kiểm tra Tiếng Anh trực tuyến
                </div>
            </div>
            {/* Right side */}
            <div className="login-right">
                <div className="login-card">
                    <div className="login-card-title">Login</div>
                    <form onSubmit={handleLogin}>
                        <div className="login-form-group">
                            <label className="login-form-label">Username: </label>
                            <input
                                type="text"
                                name="username"
                                placeholder="Username"
                                className="login-form-input"
                                required
                            />
                        </div>
                        <div className="login-form-group">
                            <label className="login-form-label">Password: </label>
                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                className="login-form-input"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="login-btn"
                        >Login</button>
                        <div className="login-links">
                            <a href="/forgot-password" className="login-link">Forgot password?</a>
                            <a href="/register" className="login-link">Register</a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default LoginView;