import { combineReducers } from '@reduxjs/toolkit';
import authReducer from "./reduxUser/Auth/authReducer";

const rootReducer = combineReducers({
    auth: authReducer,
});

export default rootReducer;