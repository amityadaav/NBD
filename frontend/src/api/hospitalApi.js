
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api/hospitals",
  headers: {
    "Content-Type": "application/json",
  },
});

export const registerHospital = async (hospitalData) => {
  const response = await API.post("/register", hospitalData);
  return response.data;
};

export const getAllHospitals = async () => {
  const response = await API.get("/");
  return response.data;
};

export const getHospitalById = async (id) => {
  const response = await API.get(`/${id}`);
  return response.data;
};

export const updateHospital = async (id, hospitalData) => {
  const response = await API.put(`/${id}`, hospitalData);
  return response.data;
};

export const deleteHospital = async (id) => {
  const response = await API.delete(`/${id}`);
  return response.data;
};
