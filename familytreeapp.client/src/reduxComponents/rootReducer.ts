import { combineReducers } from '@reduxjs/toolkit';
import navigationReducer from "./reduxShop/Navigation/navigationSlice";
import authReducer from "./reduxUser/Auth/authReducer";
import { adminReducer } from './reduxShop/Admin/adminReducers';

const rootReducer = combineReducers({
    auth: authReducer,
    admin: adminReducer,
    navigation: navigationReducer,

});

export default rootReducer;