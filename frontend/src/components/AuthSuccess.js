import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchUser } from "../redux/slices/authSlice";
import { useNavigate } from "react-router-dom";

const AuthSuccess = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");

        if (token) {
            document.cookie = `token=${token}; path=/`; // ✅ Store token in cookie
            dispatch(fetchUser()); // ✅ Dispatch Redux action to fetch user
            navigate("/"); // ✅ Redirect to home
        } else {
            navigate("/login"); // Redirect to login if no token
        }
    }, [dispatch, navigate]);

    return <p>Logging in...</p>;
};

export default AuthSuccess;
