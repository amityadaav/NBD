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

const App = () => {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/appointments"
          element={<BookAppointment />}
        />
        <Route path="/doctors" element={<FindDoctors />} />
        <Route path="/specialties" element={<Specialties />} />
        <Route path="/hospitals" element={<Hospitals />} />
        <Route path="/about" element={<About />} />
        <Route path="/bloodDonation" element={<BloodDonation/>} />

        <Route path="/list-your-clinic" element={<ListYourClinic/>}/>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </MainLayout>
  );
};

export default App;