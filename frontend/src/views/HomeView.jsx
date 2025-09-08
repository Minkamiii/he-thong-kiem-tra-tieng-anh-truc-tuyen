import React from 'react';
import { useNavigate } from 'react-router-dom';
import './css/HomeView.css';

const HomeView = () => {
    const navigate = useNavigate();

    return (
        <div className="home-root">
            {/* Header */}
            <header className="home-header">
                <div className="home-header-left">
                    <span className="home-logo"><a href="/home" className="logo-link">🅱️</a></span>
                    <span className="home-title">Bruh Web</span>
                </div>
                <div className="home-header-right">
                    <button className="home-btn" 
                        onClick={() => navigate('/login')}>Login</button>
                    <button className="home-btn" 
                        onClick={() => navigate('/register')}>Register</button>
                </div>
            </header>

            {/* Main content */}
            <main className="home-main">
                <div className="home-main-left">
                    <h1 className="home-main-title">
                        LUYỆN ĐỀ ONLINE <br /> KHÔNG GIỚI HẠN
                    </h1>
                    <ul className="home-main-features">
                        <li className="home-main-feature-item">
                            Hỗ trợ luyện thi IELTS Listening, Reading, Writing
                        </li>
                        <li className="home-main-feature-item">
                            Giao diện giống thi thật, thân thiện với người dùng
                        </li>
                        <li className="home-main-feature-item">
                            Tự chọn part và thời gian làm theo nhu cầu
                        </li>
                        <li className="home-main-feature-item">
                            Đa dạng công cụ: highlight, ghi chú, từ điển...
                        </li>
                        <li className="home-main-feature-item">
                            Report điểm tự động + đánh giá chi tiết bài làm
                        </li>
                    </ul>
                </div>
                <div className="home-main-right">
                    <div className="home-main-image-container">
                        {/* <img
                        src="https://static.study4.vn/assets/images/banner/banner-1.png"
                        alt="Online Test"
                        className="home-main-image"
                        /> */}
                        <span className="home-badge home-badge-top-left">3000+<br />đề thi</span>
                        <span className="home-badge home-badge-bottom-right">1M+<br />users</span>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="home-footer">
                <div className="home-footer-column">
                    <div className="home-footer-logo">🅱️</div>
                    <div className="home-footer-socials">
                        <a href="#"><i className="fa-brands fa-facebook"></i></a>
                        <a href="#"><i className="fa-brands fa-instagram"></i></a>
                        <a href="#"><i className="fa-brands fa-x-twitter"></i></a>
                        <a href="#"><i className="fa-brands fa-youtube"></i></a>
                        <a href="#"><i className="fa-brands fa-linkedin"></i></a>
                    </div>
                </div>
                <div className="home-footer-column">
                    {/* Route to all APIs for demonstrations */}
                    <div className="home-footer-title">Services</div>
                    <ul>
                        <li><a href="#">User Service</a></li>
                        <li><a href="#">Service 2</a></li>
                        <li><a href="#">Service 3</a></li>
                    </ul>
                </div>
                {/* Add more column if needed */}
            </footer>
        </div>
    );
}

export default HomeView;
