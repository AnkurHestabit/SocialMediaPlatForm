import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/slices/authSlice";
import { useNavigate } from "react-router-dom";

const AuthSuccess = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");
    
        if (token) {
            sessionStorage.setItem("token", token); // Store token in sessionStorage
            fetchUser(token);
        } else {
            navigate("/login"); // Redirect to login if no token
        }
    }, [dispatch, navigate]);
    
    const fetchUser = async (token) => {
        try {
            const res = await fetch("http://localhost:5000/api/v1/auth/me", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (res.ok) {
                sessionStorage.setItem("user", JSON.stringify(data)); // Store user in sessionStorage
                dispatch(setUser(data)); // Update Redux state
                navigate("/"); // Redirect to home
            }
        } catch (error) {
            console.error("Error fetching user:", error);
            navigate("/login");
        }
    };
    

    return <p>Logging in...</p>;
};

export default AuthSuccess;
