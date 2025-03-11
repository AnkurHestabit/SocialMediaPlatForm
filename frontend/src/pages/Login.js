import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../redux/slices/authSlice";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const [formData, setFormData] = useState({ email: "", password: "" });
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error, user } = useSelector((state) => state.auth); 

    // ✅ Navigate only after user is set in Redux
    useEffect(() => {
        if (user) {
            navigate("/");
        }
    }, [user, navigate]);

    // Handle form field changes
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        dispatch(login(formData));
    };

    

    const handleFacebookLogin = () => {
        window.location.href = "http://localhost:5000/api/v1/auth/facebook";
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg w-96">
                <h2 className="text-2xl font-bold text-center text-blue-600 mb-6">Login</h2>

                {/* ✅ Fixed error rendering */}
                {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 font-medium">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 transition duration-200"
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>

                {/* ✅ Google & Facebook Login Buttons */}
                <div className="mt-4 space-y-2">
                    <button
                        onClick={handleFacebookLogin}
                        className="w-full bg-blue-700 text-white py-2 rounded-lg font-semibold hover:bg-blue-800 transition duration-200"
                    >
                        Login with Facebook
                    </button>
                </div>

                <p className="text-gray-600 text-center mt-4">
                    Don't have an account? <a href="/signup" className="text-blue-600 hover:underline">Sign up</a>
                </p>
            </div>
        </div>
    );
};

export default Login;
