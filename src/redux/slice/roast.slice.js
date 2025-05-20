import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  status: 'idle', // idle, preheating, drying, firstCrack, development, finished
  heater: false,
  motor: false,
  pidControl: false,
  temperature: 0,
  elapsedTime: 0,
  preHeatTargetTemp: 0,
  dryingTargetTemp: 0,
  dryingTargetTime: 0,
  firstCrackTargetTemp: 0,
  firstCrackTargetTime: 0,
  dropTargetTemp: 0,
  dropTargetTime: 0,
  turningPoint: 0,
  isModalOpen: false,
  modalType: null, // preHeat, beansInserted, roastPlan
  tempHistory: [],
  phase: 'idle',
  error: null,
};

export const roastSlice = createSlice({
  name: 'roast',
  initialState,
  reducers: {
    setStatus: (state, action) => {
      state.status = action.payload;
    },
    toggleHeater: (state, action) => {
      state.heater = action.payload !== undefined ? action.payload : !state.heater;
    },
    toggleMotor: (state, action) => {
      state.motor = action.payload !== undefined ? action.payload : !state.motor;
    },
    togglePidControl: (state, action) => {
      state.pidControl = action.payload !== undefined ? action.payload : !state.pidControl;
    },
    setTemperature: (state, action) => {
      state.temperature = action.payload;
      state.tempHistory.push({
        elapsed: state.elapsedTime,
        temp: action.payload,
        target: state.dryingTargetTemp || state.firstCrackTargetTemp || state.dropTargetTemp
      });
    },
    incrementElapsedTime: (state) => {
      state.elapsedTime += 1;
    },
    setPreHeatTargetTemp: (state, action) => {
      state.preHeatTargetTemp = action.payload;
    },
    setDryingTargetTemp: (state, action) => {
      state.dryingTargetTemp = action.payload;
    },
    setDryingTargetTime: (state, action) => {
      state.dryingTargetTime = action.payload;
    },
    setFirstCrackTargetTemp: (state, action) => {
      state.firstCrackTargetTemp = action.payload;
    },
    setFirstCrackTargetTime: (state, action) => {
      state.firstCrackTargetTime = action.payload;
    },
    setDropTargetTemp: (state, action) => {
      state.dropTargetTemp = action.payload;
    },
    setDropTargetTime: (state, action) => {
      state.dropTargetTime = action.payload;
    },
    setTurningPoint: (state, action) => {
      state.turningPoint = action.payload;
    },
    openModal: (state, action) => {
      state.isModalOpen = true;
      state.modalType = action.payload;
    },
    closeModal: (state) => {
      state.isModalOpen = false;
      state.modalType = null;
    },
    setPhase: (state, action) => {
      state.phase = action.payload;
    },
    resetRoast: (state) => {
      return {
        ...initialState,
        tempHistory: [] // Clear history
      };
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setStatus,
  toggleHeater,
  toggleMotor,
  togglePidControl,
  setTemperature,
  incrementElapsedTime,
  setPreHeatTargetTemp,
  setDryingTargetTemp,
  setDryingTargetTime,
  setFirstCrackTargetTemp,
  setFirstCrackTargetTime,
  setDropTargetTemp,
  setDropTargetTime,
  setTurningPoint,
  openModal,
  closeModal,
  setPhase,
  resetRoast,
  setError,
} = roastSlice.actions;

export default roastSlice.reducer;