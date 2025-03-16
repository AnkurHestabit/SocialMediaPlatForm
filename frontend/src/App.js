import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { fetchUser } from "./redux/slices/authSlice"; // ✅ Fetch user from API
import { SocketProvider } from "./context/SocketContext";
import { ChatProvider } from "./context/ChatContext";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Posts from "./pages/Posts";
import Chat from "./pages/chat";
import Navbar from "./components/Navbar";
import AuthSuccess from "./components/AuthSuccess"; // ✅ OAuth Success Page
import { ToastContainer } from "react-toastify";

const App = () => {
    const dispatch = useDispatch();
    const user = useSelector((state) => state.auth.user);
    const isLoading = useSelector((state) => state.auth.isLoading);
    const [checkingAuth, setCheckingAuth] = useState(true); // ✅ Prevent flash before fetching user

    useEffect(() => {
        let isMounted = true; // ✅ Prevents unnecessary state updates on unmounted component
    
        const fetchData = async () => {
            if (isMounted) {
                await dispatch(fetchUser()); // ✅ Only fetch user once
                setCheckingAuth(false);
            }
        };
    
        fetchData(); // ✅ Fetch user only once on mount
    
        const handleStorageChange = (event) => {
            if (event.key === "auth/logout") {
                // ✅ Check if user is already logged out before refetching
                if (!user) return;
                dispatch(fetchUser());
            }
        };
    
        window.addEventListener("storage", handleStorageChange);
    
        return () => {
            isMounted = false; // ✅ Cleanup on unmount
            window.removeEventListener("storage", handleStorageChange);
        };
    }, [dispatch]); // ✅ Removed `user` from dependencies (prevents infinite loop)
    
    

    // ✅ Show loading screen while checking auth (prevents flashing login screen)
    if (checkingAuth) {
        return <div>Loading...</div>; 
    }

    return (
        <SocketProvider>
            <ChatProvider user={user}>
                <Router>
                    <Navbar user={user} /> {/* ✅ Pass user from Redux */}
                    <Routes>
                        {/* ✅ Protected Routes (Only accessible if logged in) */}
                        <Route path="/" element={user ? <Posts /> : <Navigate to="/login" />} />
                        <Route path="/chat" element={user ? <Chat /> : <Navigate to="/login" />} />

                        {/* ✅ Public Routes */}
                        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
                        <Route path="/signup" element={user ? <Navigate to="/" /> : <Signup />} />
                        <Route path="/auth-success" element={<AuthSuccess />} /> {/* ✅ OAuth Callback */}
                    </Routes>
                </Router>
                <ToastContainer position="top-right" autoClose={3000} />
            </ChatProvider>
        </SocketProvider>
    );
};

export default App;
