import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface CallState {
  audioMuted: boolean;
  videoMuted: boolean;
  remoteAudioMuted: boolean;
  isSwapped: boolean;
  remoteEmail: string;
  status: string;
  supportedModes: string[];
  roomId: string;
}

const initialState: CallState = {
  audioMuted: false,
  videoMuted: false,
  remoteAudioMuted: false,
  isSwapped: false,
  remoteEmail: "",
  status: "WAITING_FOR_PEER",
  supportedModes: [],
  roomId: "",
};

const callSlice = createSlice({
  name: "call",
  initialState,
  reducers: {
    setAudioMuted(state, action: PayloadAction<boolean>) {
      state.audioMuted = action.payload;
    },
    setVideoMuted(state, action: PayloadAction<boolean>) {
      state.videoMuted = action.payload;
    },
    setRemoteAudioMuted(state, action: PayloadAction<boolean>) {
      state.remoteAudioMuted = action.payload;
    },
    setIsSwapped(state, action: PayloadAction<boolean>) {
      state.isSwapped = action.payload;
    },
    toggleSwapped(state) {
      state.isSwapped = !state.isSwapped;
    },
    setRemoteEmail(state, action: PayloadAction<string>) {
      state.remoteEmail = action.payload;
    },
    setStatus(state, action: PayloadAction<string>) {
      state.status = action.payload;
    },
    setSupportedModes(state, action: PayloadAction<string[]>) {
      state.supportedModes = action.payload;
    },
    setRoomId(state, action: PayloadAction<string>) {
      state.roomId = action.payload;
    },
    resetCall(state) {
      return initialState;
    },
  },
});

export const {
  setAudioMuted,
  setVideoMuted,
  setRemoteAudioMuted,
  setIsSwapped,
  toggleSwapped,
  setRemoteEmail,
  setStatus,
  setSupportedModes,
  setRoomId,
  resetCall,
} = callSlice.actions;

export default callSlice.reducer;
