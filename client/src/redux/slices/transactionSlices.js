import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { addTransactionAPI, uploadReceiptAPI } from "../../api/transaction";

export const addTransaction = createAsyncThunk(
  "transaction/add",
  async (transactionData, { rejectWithValue }) => {
    try {
      const { data } = await addTransactionAPI(transactionData);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const uploadReceipt = createAsyncThunk(
  "transaction/uploadReceipt",
  async (file, { rejectWithValue }) => {
    try {
      const { data } = await uploadReceiptAPI(file);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const transactionSlice = createSlice({
  name: "transaction",
  initialState: {
    transactions: [], loading: false, error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(addTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addTransaction.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions.push(action.payload);
      })
      .addCase(addTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default transactionSlice.reducer;