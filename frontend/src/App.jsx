import { Routes, Route } from "react-router-dom";

import MainLayout from "./components/layout/MainLayout";
import Home from "./pages/Home/Home";
import BookAppointment from "./pages/BookAppointment/BookAppointment";
import FindDoctors from "./pages/FindDoctors/FindDoctors";
import Specialties from "./pages/Specialties/Specialties";
import Hospitals from "./pages/Hospitals/Hospitals";
import About from "./pages/About/About";
import Login from "./pages/Login/Login";

import "./App.css";
import Signup from "./pages/Signup/Signup";
import BloodDonation from "./pages/BloodDonation/BloodDonation";
import ListYourClinic from "./pages/ListYourClinic/ListYourClinic";
import BecomeDonor from "./pages/BecomeDonor/BecomeDonor";
import HospitalDetails from "./pages/HospitalDetails/HospitalDetails";

const App = () => {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/book-appointment"
          element={<BookAppointment />}
        />
        <Route path="/find-doctors" element={<FindDoctors />} />
        <Route path="/specialties" element={<Specialties />} />
        <Route path="/hospitals" element={<Hospitals />} />
        <Route path="/about" element={<About />} />
        <Route path="/hospitals/:id" element={<HospitalDetails />} />
        <Route path="/blood-donation" element={<BloodDonation/>} />
        <Route path="/become-donor" element={<BecomeDonor />} />
        <Route path="/list-your-clinic" element={<ListYourClinic/>}/>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </MainLayout>
  );
};

export default App;