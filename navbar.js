import React from "react";

function Navbar() {
    return (
        <nav>
            <div className="logo">
                BeautySpa
            </div>

            <div className="menu">
                <a href="/">Home</a>
                <a href="/services">Services</a>
                <a href="/about">About Us</a>
                <a href="/contact">Contact</a>
                <a href="/booking">Booking</a>
            </div>

            <div className="account">
                <a href="/login">Login</a>
                <a href="/register">Register</a>
            </div>
        </nav>
    );
}

export default Navbar;