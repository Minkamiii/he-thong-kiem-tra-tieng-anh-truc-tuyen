import './css/ForgotPasswordView.css';
import { useNavigate } from 'react-router-dom';

const ForgotPasswordView = () => {
    const navigate = useNavigate();

    const handleForgotPassword = (event) => {
        event.preventDefault();
        // Perform forgot password logic here
        const info = event.target['retrieve-info'].value;
        console.log('Retrieving password for', { info });
        // On successful forgot password, navigate to the desired route
        navigate('/login');
    };

    return (
        <div className="forgot-password-container">
            {/* Left side */}
            <div className="forgot-password-left">
                <div className="forgot-password-logo"><a href="/home" className="forgot-password-logo-link">🅱️</a></div>
                <div className="forgot-password-title">Bruh Web</div>
                <div className="forgot-password-desc">
                    Hệ thống kiểm tra Tiếng Anh trực tuyến
                </div>
            </div>
            {/* Right side */}
            <div className="forgot-password-right">
                <div className="forgot-password-card">
                    <div className="forgot-password-card-title">Forgot Password</div>
                    <form onSubmit={handleForgotPassword}>
                        <div className="forgot-password-form-group">
                            <label className="forgot-password-form-label">Username/Email/Phone number: </label>
                            <input
                                type="text"
                                name="retrieve-info"
                                placeholder="Username/Email/Phone number"
                                className="forgot-password-form-input"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="forgot-password-btn"
                        >Reset Password</button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ForgotPasswordView;