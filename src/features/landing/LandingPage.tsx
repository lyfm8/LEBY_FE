import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import LandingNavbar from './sections/LandingNavbar';
import HeroSection from './sections/HeroSection';
import FeaturesSection from './sections/FeaturesSection';
import StepsSection from './sections/StepsSection';
import CurriculumSection from './sections/CurriculumSection';
import LandingFooter from './sections/LandingFooter';
import './landing.css';

function LandingPage() {
    const location = useLocation();

    useEffect(() => {
        if (!location.hash) return;
        const target = document.getElementById(location.hash.slice(1));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    }, [location.hash]);

    return (
        <div id="landing-page">
            <LandingNavbar />
            <main>
                <HeroSection />
                <FeaturesSection />
                <StepsSection />
                <CurriculumSection />
            </main>
            <LandingFooter />
        </div>
    );
}

export default LandingPage;
