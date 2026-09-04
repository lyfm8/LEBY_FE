import LandingNavbar from './sections/LandingNavbar';
import HeroSection from './sections/HeroSection';
import FeaturesSection from './sections/FeaturesSection';
import StepsSection from './sections/StepsSection';
//import PricingSection from './sections/PricingSection';
import LandingFooter from './sections/LandingFooter';
import './landing.css';

function LandingPage() {
    return (
        <div id="landing-page">
            <LandingNavbar />
            <main>
                <HeroSection />
                <FeaturesSection />
                <StepsSection />
                {/* <PricingSection /> */}
            </main>
            <LandingFooter />
        </div>
    );
}

export default LandingPage;
