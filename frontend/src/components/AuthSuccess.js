import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchUser } from "../redux/slices/authSlice"; // ✅ Import fetchUser
import { useNavigate } from "react-router-dom";

const AuthSuccess = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                await dispatch(fetchUser()).unwrap(); // ✅ Get user from cookies
                navigate("/"); // ✅ Redirect to home after successful login
            } catch (error) {
                console.error("Error fetching user:", error);
                navigate("/login");
            }
        };

        fetchUserData();
    }, [dispatch, navigate]);

    return <p>Logging in...</p>;
};

export default AuthSuccess;
