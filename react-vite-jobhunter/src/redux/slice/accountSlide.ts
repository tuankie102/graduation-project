import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { callFetchAccount } from "@/config/api";

// First, create the thunk
export const fetchAccount = createAsyncThunk(
  "account/fetchAccount",
  async () => {
    const response = await callFetchAccount();
    return response.data;
  }
);

interface IState {
  isAuthenticated: boolean;
  isLoading: boolean;
  isRefreshToken: boolean;
  errorRefreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    balance: number;
    age?: number;
    gender?: string;
    address?: string;
    role: {
      id?: string;
      name?: string;
      active?: boolean;
      permissions?: {
        id: string;
        name: string;
        apiPath: string;
        method: string;
        module: string;
      }[];
    };
    company?: {
      id: string;
      name: string;
      logo: string;
    };
  };
  activeMenu: string;
}

const initialState: IState = {
  isAuthenticated: false,
  isLoading: true,
  isRefreshToken: false,
  errorRefreshToken: "",
  user: {
    id: "",
    email: "",
    name: "",
    balance: 0,
    age: undefined,
    gender: undefined,
    address: undefined,
    role: {
      id: "",
      name: "",
      active: false,
      permissions: [],
    },
    company: {
      id: "",
      name: "",
      logo: "",
    },
  },
  activeMenu: "home",
};

export const accountSlide = createSlice({
  name: "account",
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    // Use the PayloadAction type to declare the contents of `action.payload`
    setActiveMenu: (state, action) => {
      state.activeMenu = action.payload;
    },
    setUserLoginInfo: (state, action) => {
      state.isAuthenticated = true;
      state.isLoading = false;
      state.user.id = action?.payload?.id;
      state.user.email = action.payload.email;
      state.user.name = action.payload.name;
      state.user.balance = action.payload.balance;
      state.user.age = action.payload.age;
      state.user.gender = action.payload.gender;
      state.user.address = action.payload.address;
      state.user.role = action?.payload?.role;
      state.user.company = action?.payload?.company;

      if (!action?.payload?.user?.role) state.user.role = {};
      state.user.role.permissions = action?.payload?.role?.permissions ?? [];
    },
    setLogoutAction: (state, action) => {
      localStorage.removeItem("access_token");
      state.isAuthenticated = false;
      state.user = {
        id: "",
        email: "",
        name: "",
        balance: 0,
        age: undefined,
        gender: undefined,
        address: undefined,
        role: {
          id: "",
          name: "",
          active: false,
          permissions: [],
        },
        company: {
          id: "",
          name: "",
          logo: "",
        },
      };
    },
    setRefreshTokenAction: (state, action) => {
      state.isRefreshToken = action.payload?.status ?? false;
      state.errorRefreshToken = action.payload?.message ?? "";
    },
  },
  extraReducers: (builder) => {
    // Add reducers for additional action types here, and handle loading state as needed
    builder.addCase(fetchAccount.pending, (state, action) => {
      if (action.payload) {
        state.isAuthenticated = false;
        state.isLoading = true;
      }
    });

    builder.addCase(fetchAccount.fulfilled, (state, action) => {
      if (action.payload) {
        state.isAuthenticated = true;
        state.isLoading = false;
        state.user.id = action?.payload?.user?.id;
        state.user.email = action.payload.user?.email;
        state.user.name = action.payload.user?.name;
        state.user.balance = action.payload.user?.balance;
        state.user.age = action.payload.user?.age;
        state.user.gender = action.payload.user?.gender;
        state.user.address = action.payload.user?.address;
        state.user.role = action?.payload?.user?.role;
        if (!action?.payload?.user?.role) state.user.role = {};
        state.user.role.active = action?.payload?.user?.role?.active ?? false;
        state.user.role.permissions =
          action?.payload?.user?.role?.permissions ?? [];
        state.user.company = action?.payload?.user?.company;
      }
    });

    builder.addCase(fetchAccount.rejected, (state, action) => {
      if (action.payload) {
        state.isAuthenticated = false;
        state.isLoading = false;
      }
    });
  },
});

export const {
  setActiveMenu,
  setUserLoginInfo,
  setLogoutAction,
  setRefreshTokenAction,
} = accountSlide.actions;

export default accountSlide.reducer;
