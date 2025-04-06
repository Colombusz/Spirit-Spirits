import { createSlice } from '@reduxjs/toolkit';
import { createPromo, getAllPromos } from '../actions/promoAction';
const initialState = {
    promos: [],
    loading: false,
    error: null,
};

const promoSlice = createSlice({
    name: 'promo',
    initialState,
    reducers: {
        setPromos: (state, action) => {
            state.promos = action.payload;
        },
        clearPromos: (state) => {
            state.promos = [];
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(createPromo.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createPromo.fulfilled, (state, action) => {
                state.loading = false;
                // state.promos = action.payload;
            })
            .addCase(createPromo.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            
            .addCase(getAllPromos.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAllPromos.fulfilled, (state, action) => {
                state.loading = false;
                state.promos = action.payload;
            })
            .addCase(getAllPromos.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            
            ;


    },
});


export default promoSlice.reducer;
