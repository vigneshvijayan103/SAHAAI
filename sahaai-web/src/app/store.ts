import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import serviceReducer from '../features/services/serviceSlice';
import locationReducer from '../features/location/locationSlice';
import serviceRequestReducer from '../features/serviceRequest/serviceRequestSlice';
import profileReducer from '../features/profile/profileSlice';
import adminReducer from '../features/admin/adminSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    services: serviceReducer,
    location: locationReducer,
    serviceRequest: serviceRequestReducer,
    profile: profileReducer,
    admin: adminReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

