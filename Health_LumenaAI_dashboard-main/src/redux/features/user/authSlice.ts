// /* eslint-disable @typescript-eslint/no-unused-vars */
// import { createSlice, PayloadAction } from "@reduxjs/toolkit";
// import Cookies from "js-cookie";
// // Helper function to get stored token
// const getStoredAccessToken = () => {
//   if (typeof window === "undefined") return null;
//   return localStorage.getItem("accessToken");
// };
// const getStoredRefreshToken = () => {
//   if (typeof window === "undefined") return null;
//   return localStorage.getItem("refreshToken");
// };

// // Helper function to get stored user
// // const getStoredUser = () => {
// //   if (typeof window === "undefined") return null;

// //   const userString = localStorage.getItem("admin");
// //   if (!userString) return null;

// //   try {
// //     return JSON.parse(userString);
// //   } catch (error) {
// //     localStorage.removeItem("admin");
// //     return null;
// //   }
// // };
// // User interface
// export interface User {
//   id: string;
//   name: string;
//   email: string;
//   avatar?: string;
//   role?: string;
// }

// // Auth state interface
// export interface AuthState {
//   user: User | null;
//   accessToken: string | null;
//   refreshToken?: string | null;
// }

// const initialState: AuthState = {
//   user: null,
//   accessToken: getStoredAccessToken(),
//   refreshToken: getStoredRefreshToken(),
// };

// // Helper functions for safe storage access
// const setLocalStorage = (key: string, value: string) => {
//   if (typeof window !== "undefined") {
//     localStorage.setItem(key, value);
//   }
// };

// const getLocalStorage = (key: string): string | null => {
//   if (typeof window !== "undefined") {
//     return localStorage.getItem(key);
//   }
//   return null;
// };

// const removeLocalStorage = (key: string) => {
//   if (typeof window !== "undefined") {
//     localStorage.removeItem(key);
//   }
// };

// const authSlice = createSlice({
//   name: "auth",
//   initialState,
//   reducers: {
//     setUser: (state, action: PayloadAction<User>) => {
//       state.user = action.payload;

//       // Store in localStorage (SSR-safe)
//       setLocalStorage("authUser", JSON.stringify(action.payload));

//       // Store in cookies (SSR-safe)
//       //   if (typeof window !== "undefined") {
//       //     Cookies.set("authUser", JSON.stringify(action.payload), {
//       //       expires: 7, // 7 days
//       //       secure: process.env.NODE_ENV === "production",
//       //       sameSite: "strict",
//       //     });
//       //   }
//     },

//     setTokens: (
//       state,
//       action: PayloadAction<{ accessToken: string; refreshToken?: string }>
//     ) => {
//       state.accessToken = action.payload.accessToken;
//       state.refreshToken = action.payload.refreshToken;

//       // Store tokens in localStorage
//       setLocalStorage("accessToken", action.payload.accessToken);
//       setLocalStorage("refreshToken", action.payload.refreshToken as string);

//       // Store tokens in cookies with appropriate expiration
//       if (typeof window !== "undefined") {
//         Cookies.set("accessToken", action.payload.accessToken);
//         Cookies.set("refreshToken", action.payload.refreshToken as string);
//       }
//       //   if (typeof window !== "undefined") {
//       //     Cookies.set("accessToken", action.payload.accessToken, {
//       //       expires: 1, // 1 day for access token
//       //       secure: process.env.NODE_ENV === "production",
//       //       sameSite: "strict",
//       //     });
//       //     Cookies.set("refreshToken", action.payload.refreshToken, {
//       //       expires: 7, // 7 days for refresh token
//       //       secure: process.env.NODE_ENV === "production",
//       //       sameSite: "strict",
//       //     });
//       //   }
//     },

//     logout: (state) => {
//       state.user = null;
//       state.accessToken = null;
//       state.refreshToken = null;

//       // Remove from localStorage
//       removeLocalStorage("authUser");
//       removeLocalStorage("accessToken");
//       removeLocalStorage("refreshToken");

//       // Remove from cookies
//       if (typeof window !== "undefined") {
//         Cookies.remove("authUser");
//         Cookies.remove("accessToken");
//         Cookies.remove("refreshToken");
//       }
//     },

//     // Initialize auth state from stored data (call on app load)
//     initializeAuth: (state) => {
//       const storedUser = getLocalStorage("authUser");
//       const storedAccessToken = getLocalStorage("accessToken");
//       const storedRefreshToken = getLocalStorage("refreshToken");

//       if (storedUser && storedAccessToken) {
//         try {
//           state.user = JSON.parse(storedUser);
//           state.accessToken = storedAccessToken;
//           state.refreshToken = storedRefreshToken;
//         } catch (error) {
//           // If parsing fails, clear corrupted data
//           //   console.error("Error parsing stored user data:", error);
//           removeLocalStorage("authUser");
//           removeLocalStorage("accessToken");
//           removeLocalStorage("refreshToken");
//         }
//       }
//     },

//     // Clear any existing auth errors
//     clearAuthError: () => {
//       // This can be extended if you add error handling
//     },
//   },
// });

// // Export actions
// export const {
//   setUser,
//   setTokens,

//   logout,
//   initializeAuth,
//   clearAuthError,
// } = authSlice.actions;

// // Selectors
// export const selectAuth = (state: { auth: AuthState }) => state.auth;
// export const selectUser = (state: { auth: AuthState }) => state.auth.user;

// // Export reducer
// export default authSlice.reducer;

import { IAdminProfile } from "@/types/global";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

// Auth state interface
export interface AuthState {
  user: IAdminProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  resetPassToken: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  resetPassToken: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<IAdminProfile | null>) => {
      state.user = action.payload;
    },

    setTokens: (
      state,
      action: PayloadAction<{ accessToken: string; refreshToken?: string }>
    ) => {
      const { accessToken, refreshToken } = action.payload;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken ?? null;

      Cookies.set("accessToken", accessToken);
      if (refreshToken) {
        Cookies.set("refreshToken", refreshToken);
      } else {
        Cookies.remove("refreshToken");
      }
    },

    setResetPassToken: (state, action: PayloadAction<string>) => {
      state.resetPassToken = action.payload;
    },
    clearResetPassToken: (state) => {
      state.resetPassToken = null;
    },

    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;

      Cookies.remove("authUser");
      Cookies.remove("accessToken");
      Cookies.remove("refreshToken");
    },

    clearAuthError: () => {},
  },
});

export const {
  setUser,
  setTokens,
  logout,
  clearAuthError,
  setResetPassToken,
  clearResetPassToken,
} = authSlice.actions;

// Selectors
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;

export default authSlice.reducer;
