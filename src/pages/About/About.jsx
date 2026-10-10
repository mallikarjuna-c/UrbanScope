import React from 'react'
import Styles from "./About.module.css"
import vision from "../../assets/vision.svg"
import method from "../../assets/method.svg"

function About() {
    return (
        <div id={Styles.container}>

            <section id={Styles.section_1}>
                <h1>About UrbanScope</h1>
                <p><b>
                    "UrbanScope is your gateway to understanding urban health through NASA Earth observations. Making satellite data accessible for healthier cities and sustainable communities."
                </b></p>
            </section>

            <section id={Styles.section_2}>
                <h1><u>Our Vision </u></h1>
                <div>
                    <p>Explore urban health with UrbanScope and stay informed about how NASA Earth observations can drive healthier cities. Join us in discovering patterns in heat islands, air quality, and green spaces. As an open source organization, we are committed to transparency, collaboration, and community-driven development.</p>
                    <img src={vision} width='400px' height='400px' />
                </div>
            </section>

            <section id={Styles.section_3}>
                <h1><u>Our Methods</u></h1>
                <div>
                    <img src={method} width='400px' height='400px' />
                    <p>Our platform brings you NASA Earth observation data including land surface temperature, vegetation indices, and air quality metrics. Utilizing NASA's GIBS API and EARTHDATA services, we deliver a seamless experience for city planners, researchers, and citizens to understand urban health patterns.</p>
                </div>
            </section>



        </div>
    )
}

export default About