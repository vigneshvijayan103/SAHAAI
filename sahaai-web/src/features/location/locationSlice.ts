import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { locationApi } from '../../api/locationApi';
import type {
  AddressResponseDto,
  AddAddressDto,
  UpdateAddressDto,
} from '../../types/location.types';

interface LocationState {
  addresses: AddressResponseDto[];
  defaultAddress: AddressResponseDto | null;
  selectedAddress: AddressResponseDto | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: LocationState = {
  addresses: [],
  defaultAddress: null,
  selectedAddress: null,
  isLoading: false,
  error: null,
};

export const fetchAddresses = createAsyncThunk(
  'location/fetchAddresses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await locationApi.getAll();
      return Array.isArray(response.data) ? response.data : [];
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch addresses');
    }
  }
);

export const fetchDefaultAddress = createAsyncThunk(
  'location/fetchDefaultAddress',
  async (_, { rejectWithValue }) => {
    try {
      const response = await locationApi.getDefault();
      return response.data || null;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch default address');
    }
  }
);

export const addAddress = createAsyncThunk(
  'location/addAddress',
  async (dto: AddAddressDto, { rejectWithValue }) => {
    try {
      const response = await locationApi.addAddress(dto);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to add address');
    }
  }
);

export const updateAddress = createAsyncThunk(
  'location/updateAddress',
  async ({ id, dto }: { id: number; dto: UpdateAddressDto }, { rejectWithValue }) => {
    try {
      const response = await locationApi.updateAddress(id, dto);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to update address');
    }
  }
);

export const deleteAddress = createAsyncThunk(
  'location/deleteAddress',
  async (id: number, { rejectWithValue }) => {
    try {
      await locationApi.deleteAddress(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to delete address');
    }
  }
);

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    selectAddress: (state, action: PayloadAction<AddressResponseDto | null>) => {
      state.selectedAddress = action.payload;
    },
    clearLocationError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch all
    builder
      .addCase(fetchAddresses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.addresses = action.payload;
        const def = action.payload.find((a) => a.isDefault);
        if (def) {
          state.defaultAddress = def;
          if (!state.selectedAddress) {
            state.selectedAddress = def;
          }
        }
      })
      .addCase(fetchAddresses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch default
    builder.addCase(fetchDefaultAddress.fulfilled, (state, action) => {
      if (action.payload) {
        state.defaultAddress = action.payload;
        if (!state.selectedAddress) {
          state.selectedAddress = action.payload;
        }
      }
    });

    // Add
    builder.addCase(addAddress.fulfilled, (state, action) => {
      if (action.payload) {
        if (action.payload.isDefault) {
          state.addresses.forEach((a) => (a.isDefault = false));
          state.defaultAddress = action.payload;
        }
        state.addresses.push(action.payload);
        state.selectedAddress = action.payload;
      }
    });

    // Update
    builder.addCase(updateAddress.fulfilled, (state, action) => {
      if (action.payload) {
        const index = state.addresses.findIndex((a) => a.id === action.payload.id);
        if (index !== -1) {
          if (action.payload.isDefault) {
            state.addresses.forEach((a) => (a.isDefault = false));
            state.defaultAddress = action.payload;
          }
          state.addresses[index] = action.payload;
        }
      }
    });

    // Delete
    builder.addCase(deleteAddress.fulfilled, (state, action) => {
      state.addresses = state.addresses.filter((a) => a.id !== action.payload);
      if (state.selectedAddress?.id === action.payload) {
        state.selectedAddress = state.addresses[0] || null;
      }
      if (state.defaultAddress?.id === action.payload) {
        state.defaultAddress = state.addresses.find((a) => a.isDefault) || null;
      }
    });
  },
});

export const { selectAddress, clearLocationError } = locationSlice.actions;
export default locationSlice.reducer;

