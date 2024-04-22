import React from 'react';
import "../App.css";

function NavBar() {

    return (
        <section className='nav-bar'>
            <nav>
                <div className="logo">
                    <p>TODO</p>
                </div>
                <ul className='nav-links'>
                    <li><a href="/home">DATA-FIRST</a></li>
                    <li><a href="/vizfirst">VIZ-FIRST</a></li>
                </ul>
            </nav>
        </section>
    )

}

export default NavBar;