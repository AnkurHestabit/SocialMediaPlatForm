
import { useDispatch } from "react-redux";
import { logout } from "../redux/slices/authSlice";

const Navbar = ({ user }) => {
    const dispatch = useDispatch();

    const handleLogout = () => {
        dispatch(logout());
    };

    return (
        <nav className="p-4 bg-blue-500 text-white flex justify-between">
            <h1 className="text-xl font-bold">My App</h1>
            {user ? (
                <button onClick={handleLogout} className="bg-red-500 px-4 py-2 rounded">
                    Logout
                </button>
            ) : (
                <a href="/login" className="bg-green-500 px-4 py-2 rounded">Login</a>
            )}
        </nav>
    );
};

export default Navbar;
