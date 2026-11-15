import { useCallback, useEffect, useState } from "react";
import api from "../services/api";

const POLL_MS = 60000;

export default function useHospitalAlerts() {
  const [alerts, setAlerts] = useState({
    pendingAppointments: 0,
    pendingDoctors: 0,
    latestAppointments: [],
    hospitalName: "",
  });

  const load = useCallback(async () => {
    const results = await Promise.allSettled([
      api.get("/hospital-admin/appointments", { params: { status: "Pending", limit: 5 } }),
      api.get("/hospital-admin/doctors", { params: { status: "Pending", limit: 1 } }),
    ]);

    setAlerts((prev) => ({
      ...prev,
      pendingAppointments:
        results[0].status === "fulfilled" ? Number(results[0].value.data?.total ?? 0) : prev.pendingAppointments,
      latestAppointments:
        results[0].status === "fulfilled" ? results[0].value.data?.appointments || [] : prev.latestAppointments,
      pendingDoctors:
        results[1].status === "fulfilled" ? Number(results[1].value.data?.total ?? 0) : prev.pendingDoctors,
    }));
  }, []);

  // Hospital name (once)
  useEffect(() => {
    api
      .get("/hospital-admin/profile")
      .then(({ data }) =>
        setAlerts((prev) => ({ ...prev, hospitalName: data.hospital?.hospitalName || "" }))
      )
      .catch(() => {});
  }, []);

  useEffect(() => {
    load();
    const timer = setInterval(load, POLL_MS);
    return () => clearInterval(timer);
  }, [load]);

  return { ...alerts, refresh: load };
}