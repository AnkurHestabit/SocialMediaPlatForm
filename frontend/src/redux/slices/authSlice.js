import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { loginUser, registerUser, getUserProfile, logoutUser,getUserProfileForFaceBook } from "../../services/api";
import store from '../store'

// ✅ Signup Thunk (New User Registration)
export const signup = createAsyncThunk("auth/signup", async (userData, { rejectWithValue }) => {
    try {
        const { data } = await registerUser(userData);
        return data.user; // Return user data
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || "Signup failed");
    }
});

// ✅ Fetch User on App Load (Check Cookie)
export const fetchUser = createAsyncThunk("auth/fetchUser", async (_, { rejectWithValue }) => {
    try {
        const response = await getUserProfile();
        const user = response.data?.data;

        if (!user) throw new Error("No user found");

        return user; // Return user object directly
    } catch (error) {
        return rejectWithValue(null); // No user found, return null
    }
});



// ✅ Login Thunk
export const login = createAsyncThunk("auth/login", async (credentials, { rejectWithValue }) => {
    try {
        const { data } = await loginUser(credentials);
        return {
            user: data.data.user,
            accessToken: data.data.accessToken,
            refreshToken: data.data.refreshToken,
        };
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || "Login failed");
    }
});

// ✅ Logout Thunk
export const logout = createAsyncThunk("auth/logout", async (_, { rejectWithValue }) => {
    try {
        await logoutUser(); // Clears session cookie on the backend

        localStorage.setItem("auth/logout", Date.now()); // Notify other tabs
        return null; // Reset user state
    } catch (error) {
        return rejectWithValue("Logout failed");
    }
});

// Auth Slice
const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: null,
        accessToken: null,
        refreshToken: null,
        loading: false,
        error: null,
    },
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload;
        },
        updateToken: (state, action) => {
            state.accessToken = action.payload; // Update access token
        },
        clearAuthState: (state) => {
            state.user = null;
            state.accessToken = null;
            state.refreshToken = null;
            state.error = null;
            state.loading = false;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch User
            .addCase(fetchUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.accessToken = action.payload.accessToken;
                state.refreshToken = action.payload.refreshToken;
            })
            .addCase(fetchUser.rejected, (state, action) => {
                state.loading = false;
                state.user = null;
                state.error = action.payload;
            })
          

            // Signup
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
            })

            // Login
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.accessToken = action.payload.accessToken;
                state.refreshToken = action.payload.refreshToken;

            
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Logout
            .addCase(logout.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(logout.fulfilled, (state) => {
                state.user = null;
                state.accessToken = null;
                state.refreshToken = null;
                state.error = null;
                state.loading = false;
            })
            .addCase(logout.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { setUser, updateToken, clearAuthState } = authSlice.actions;
export default authSlice.reducer;