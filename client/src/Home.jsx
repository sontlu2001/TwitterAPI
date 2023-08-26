import React from 'react';
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { Link } from 'react-router-dom';

const getGoogleAuthUrl = () => {
    const { VITE_GOOGLE_CLIENT_ID, VITE_GOOGLE_REDIRECT_URI } = import.meta.env
    const url = `https://accounts.google.com/o/oauth2/v2/auth`
    const queryParams = {
        client_id: VITE_GOOGLE_CLIENT_ID,
        redirect_uri: VITE_GOOGLE_REDIRECT_URI,
        response_type: 'code',
        scope: [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email'
        ].join(' '),
        prompt: 'consent',
    }
    const queryString = new URLSearchParams(queryParams).toString()
    return `${url}?${queryString}`
}
const googleAuthUrl = getGoogleAuthUrl()
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

            <Link to={googleAuthUrl}>
                Login with Google
            </Link>
        </>
    )
};

export default Home;