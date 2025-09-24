import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import transactionReducer from "./slices/transactionSlices";
import dashboardReducer from "./slices/dashboardSlice";
import reportReducer from "./slices/reportSlice";
import profileReducer from "./slices/profileSlice";
import budgetReducer from "./slices/budgetSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    transactions: transactionReducer,
    dashboard: dashboardReducer,
    reports: reportReducer,
    profile: profileReducer,
    budget: budgetReducer,
  },
});

export default store;