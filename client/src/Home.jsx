import React from 'react';
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <>
            <div>
                <span>
                    <img src={viteLogo} className="logo" alt="Vite logo" />
                </span>
                <span>
                    <img src={reactLogo} className="logo react" alt="React logo" />
                </span>
            </div>
            <h1>Authentication Oauth2</h1>

            <Link to='/login/oauth'>
                Login with Google
            </Link>
        </>
    )
};

export default Home;