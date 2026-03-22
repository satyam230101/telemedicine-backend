import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem("role");

    if (role === "doctor") {
      navigate("/doctor");
    } else {
      navigate("/patient");
    }
  }, []);

  return <h1 className="text-center mt-20 text-xl">Loading...</h1>;
}