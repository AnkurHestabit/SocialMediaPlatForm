import { useDispatch } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import { Link } from "react-router-dom";
import { Home, Send, Compass, User } from "lucide-react"; // Icons
import { motion } from "framer-motion";

const Navbar = ({ user }) => {
    const dispatch = useDispatch();

    const handleLogout = () => {
        dispatch(logout());
    };

    return (
        <nav className="p-4 bg-black shadow-md flex justify-between items-center border-b border-gray-800">
            {/* Instagram-style Logo */}
            <Link to="/" className="text-xl font-bold text-white tracking-wide">
                SocialMedia
            </Link>

            {/* Center Navigation (Icons like Instagram) */}
            <div className="hidden md:flex space-x-6">
                <Link to="/" className="text-gray-400 hover:text-white transition">
                    <Home size={24} />
                </Link>
                <Link to="/" className="text-gray-400 hover:text-white transition">
                    <Compass size={24} />
                </Link>
                <Link to="/" className="text-gray-400 hover:text-white transition">
                    <Send size={24} />
                </Link>
            </div>

            {/* Right Section (Profile & Logout) */}
            <div className="flex items-center space-x-4">
                {user ? (
                    <>
                        {/* Profile Picture */}
                        <Link to="/profile">
                            <motion.img
                                src={user.profilePic || "https://via.placeholder.com/40"}
                                alt="Profile"
                                className="w-10 h-10 rounded-full border border-gray-500 object-cover hover:scale-110 transition"
                                whileHover={{ scale: 1.1 }}
                            />
                        </Link>

                        {/* Logout Button */}
                        <button
                            onClick={handleLogout}
                            className="bg-red-500 text-white px-4 py-2 rounded-md font-semibold hover:bg-red-600 transition"
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <Link to="/login">
                        <button className="bg-blue-500 text-white px-4 py-2 rounded-md font-semibold hover:bg-blue-600 transition">
                            Login
                        </button>
                    </Link>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
