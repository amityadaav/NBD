import Hero from "../../components/home/Hero/Hero";
// import FindDoctors from "../../components/home/FindDoctors/FindDoctors";
import DoctorsNearYou from "../../components/home/DoctorsNearYou/DoctorsNearYou";
import Specialties from "../../components/home/Specialties/SpecialtiesSection";
import HowItWorks from "../../components/home/HowItWorks/HowItWorks";
import PopularHospitals from "../../components/home/Hospitals/PopularHospitals";
import WhyChooseUs from "../../components/home/WhyChooseUs/WhyChooseUs";
import CTASection from "../../components/home/CTASection/CTASection";
import "./Home.css";

const Home = () => {
  return (
    <div className="home-page">
      <Hero />

      {/* <FindDoctors /> */}

      <DoctorsNearYou />

      <Specialties />

      <PopularHospitals />

      <HowItWorks />

      <WhyChooseUs />

      <CTASection />
    </div>
  );
};

export default Home;