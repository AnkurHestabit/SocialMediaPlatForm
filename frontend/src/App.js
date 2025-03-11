import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { setUser } from "./redux/slices/authSlice";
import { SocketProvider } from "./context/SocketContext";
import { ChatProvider } from "./context/ChatContext";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Posts from "./pages/Posts";
import Chat from "./pages/chat";
import Navbar from "./components/Navbar";
import AuthSuccess from "./components/AuthSuccess"; // ✅ Import OAuth handler
import { ToastContainer } from "react-toastify";


const App = () => {
    const dispatch = useDispatch();
    const user = useSelector((state) => state.auth.user); // ✅ Get user from Redux

    // ✅ Check sessionStorage for token & update Redux state
    useEffect(() => {
        const storedUser = sessionStorage.getItem("user");

        if (storedUser) {
            dispatch(setUser(JSON.parse(storedUser))); // Set user in Redux store
        }
    }, [dispatch]);

    return (
        <SocketProvider>
            <ChatProvider user={user}>
                <Router>
                    <Navbar user={user} /> {/* ✅ Pass user from Redux */}
                    <Routes>
                        <Route path="/" element={user ? <Posts /> : <Navigate to="/login" />} />
                        <Route path="/chat" element={user ? <Chat /> : <Navigate to="/login" />} /> {/* ✅ Protect Chat */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/auth-success" element={<AuthSuccess />} /> {/* ✅ Handle OAuth */}
                    </Routes>
                </Router>
                <ToastContainer position="top-right" autoClose={3000} />
            </ChatProvider>
        </SocketProvider>
    );
};

export default App;
