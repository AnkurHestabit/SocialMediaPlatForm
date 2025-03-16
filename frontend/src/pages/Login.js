import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { login, fetchUser } from "../redux/slices/authSlice";
import { useNavigate } from "react-router-dom";

const schema = yup.object().shape({
    email: yup.string().email("Invalid email format").required("Email is required"),
    password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
});

const Login = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error, user } = useSelector((state) => state.auth);

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
    });

    useEffect(() => {
        dispatch(fetchUser());
    }, [dispatch]);

    useEffect(() => {
        if (user) navigate("/");
    }, [user, navigate]);

    const onSubmit = (data) => {
        dispatch(login(data));
    };

    const handleFacebookLogin = () => {
        window.location.href = "https://socialmediaplatform-dmhm.onrender.com/api/v1/auth/facebook";
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900">
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-96 text-center text-white">
                <h2 className="text-4xl font-bold mb-6 text-pink-500">Social Media</h2>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <input
                        type="email"
                        placeholder="Email"
                        {...register("email")}
                        className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:ring-2 focus:ring-blue-400"
                    />
                    {errors.email && <p className="text-red-400 text-sm">{errors.email.message}</p>}

                    <input
                        type="password"
                        placeholder="Password"
                        {...register("password")}
                        className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:ring-2 focus:ring-blue-400"
                    />
                    {errors.password && <p className="text-red-400 text-sm">{errors.password.message}</p>}

                    <button
                        type="submit"
                        className="w-full bg-pink-500 text-white py-2 rounded-md font-semibold hover:bg-pink-600 transition duration-200"
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : "Log in"}
                    </button>
                </form>

                <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-600"></div>
                    </div>
                    <div className="relative text-gray-400 text-sm bg-gray-800 px-4">OR</div>
                </div>

                <button
                    onClick={handleFacebookLogin}
                    className="w-full flex items-center justify-center bg-blue-700 text-white py-2 rounded-md font-semibold hover:bg-blue-800 transition duration-200"
                >
                    <span className="mr-2">📘</span> Log in with Facebook
                </button>

                <p className="text-sm text-blue-400 mt-3 cursor-pointer hover:underline">Forgot password?</p>

                <div className="mt-4 border-t border-gray-600 pt-4">
                    <p className="text-gray-400">
                        Don't have an account?{" "}
                        <a href="/signup" className="text-pink-400 font-semibold hover:underline">Sign up</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
