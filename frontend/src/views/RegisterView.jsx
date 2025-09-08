import './css/RegisterView.css';
import { useNavigate } from 'react-router-dom';

const RegisterView = () => {
    const navigate = useNavigate();

    const handleRegister = (event) => {
        event.preventDefault();
        // Perform registration logic here
        // Hardcoded for demonstration purposes
        const username = event.target.username.value;
        const password = event.target.password.value;
        const email = event.target.email.value;
        const phoneNumber = event.target.phoneNumber.value;
        const dateOfBirth = event.target.dateOfBirth.value;
        console.log('Registering with', { username, password, email, phoneNumber, dateOfBirth });
        // On successful registration, navigate to the desired route
        navigate('/login');
    };

    return (
        <div className="register-container">
            {/* Left side */}
            <div className="register-left">
                <div className="register-logo"><a href="/home" className="register-logo-link">🅱️</a></div>
                <div className="register-title">Bruh Web</div>
                <div className="register-desc">
                    Hệ thống kiểm tra Tiếng Anh trực tuyến
                </div>
            </div>
            {/* Right side */}
            <div className="register-right">
                <div className="register-card">
                    <div className="register-card-title">Register</div>
                    <form onSubmit={handleRegister}>
                        <div className="register-form-group">
                            <label className="register-form-label">Username: </label>
                            <input
                                type="text"
                                name="username"
                                placeholder="Username"
                                className="register-form-input"
                                required
                            />
                        </div>
                        <div className="register-form-group">
                            <label className="register-form-label">Password: </label>
                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                className="register-form-input"
                                required
                            />
                        </div>
                        <div className="register-form-group">
                            <label className="register-form-label">Email: </label>
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                className="register-form-input"
                                required
                            />
                        </div>
                        {/* <div className="register-form-line">
                            
                        </div> */}
                        <div className="register-form-group">
                            <label className="register-form-label">Phone Number: </label>
                            <input
                                type="text"
                                name="phoneNumber"
                                placeholder="Phone Number"
                                className="register-form-input"
                                required
                            />
                        </div>
                        <div className="register-form-group">
                            <label className="register-form-label">Date of Birth: </label>
                            <input
                                type="date"
                                name="dateOfBirth"
                                placeholder="Date of Birth"
                                className="register-form-input"
                                required
                            />
                        </div>
                        <div className="register-btn-container">
                            <button
                                type="submit"
                                className="register-btn"
                            >Register</button>
                            <button
                                type="button"
                                className="register-back-btn"
                                onClick={() => navigate('/login')}
                            >Back</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default RegisterView;