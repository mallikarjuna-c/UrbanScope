import React from 'react'
import Hero from '../../components/Hero/Hero.jsx'
import Apod from '../../components/Apod/Apod.jsx'
import './Home.css'

function Home() {
    return (
        <div className="home-page">
            <Hero />
            <Apod />
        </div>
    )
}

export default Home