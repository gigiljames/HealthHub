import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface DProfileCreationState {
  name: string;
  specialization: string;
  gender: string;
  dob: string;
}

const initialState: DProfileCreationState = {
  name: "",
};

const dProfileCreationSlice = createSlice({
  name: "dProfileCreation",
  initialState: initialState,
  reducers: {
    setName: (state, action: PayloadAction<string>) => {
      state.name = action.payload;
    },
  },
});

export const { setName } = dProfileCreationSlice.actions;

export default dProfileCreationSlice.reducer;
