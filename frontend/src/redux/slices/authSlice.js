import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { loginUser, registerUser } from "../../services/api";

// Async thunk for login
export const login = createAsyncThunk("auth/login", async (credentials, { rejectWithValue }) => {
    try {
        const { data } = await loginUser(credentials);
        sessionStorage.setItem("user", JSON.stringify(data.data.user)); // 🔥 Store user in sessionStorage
        sessionStorage.setItem("token", data.data.token);
        return data.data.user;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || "Login failed");
    }
});

// Async thunk for signup
export const signup = createAsyncThunk("auth/signup", async (userData, { rejectWithValue }) => {
    try {
        const { data } = await registerUser(userData);
        sessionStorage.setItem("user", JSON.stringify(data.user)); // 🔥 Store user in sessionStorage
        return data.user;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || "Signup failed");
    }
});

// Auth Slice
const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: JSON.parse(sessionStorage.getItem("user")) || null, 
        loading: false,
        error: null,
    },
    reducers: {
        logout: (state) => {
            sessionStorage.removeItem("user"); // 🔥 Clear sessionStorage
            sessionStorage.removeItem("token");

            // // ✅ Clear Facebook OAuth session
            // window.location.href = "https://www.facebook.com/logout.php?next=http://localhost:3000/login&access_token=" + sessionStorage.getItem("token");

            state.user = null;
        },
        setUser: (state, action) => { // ✅ Added this to manually set user
            state.user = action.payload;
            sessionStorage.setItem("user", JSON.stringify(action.payload));
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(signup.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(signup.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
            })
            .addCase(signup.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { logout, setUser } = authSlice.actions; // ✅ Export setUser
export default authSlice.reducer;
