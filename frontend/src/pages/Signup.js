import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { signup } from "../redux/slices/authSlice";
import { useNavigate } from "react-router-dom";

const Signup = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error } = useSelector((state) => state.auth);

    const handleSignup = async (e) => {
        e.preventDefault();
        const result = await dispatch(signup({ name, email, password }));
        if (result.meta.requestStatus === "fulfilled") {
            navigate("/");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold text-center text-gray-700">Create an Account</h2>
                
                {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}

                <form onSubmit={handleSignup} className="mt-4 space-y-4">
                    <div>
                        <label className="block text-gray-600 text-sm">Name</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                            placeholder="Enter your name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-600 text-sm">Email</label>
                        <input
                            type="email"
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-600 text-sm">Password</label>
                        <input
                            type="password"
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
                        disabled={loading}
                    >
                        {loading ? "Signing up..." : "Sign Up"}
                    </button>
                </form>

                <p className="text-center text-gray-600 text-sm mt-4">
                    Already have an account? <a href="/login" className="text-blue-500 hover:underline">Login</a>
                </p>
            </div>
        </div>
    );
};

export default Signup;
