import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './reduxUser/Auth/authReducer';
import familyTreeReducer from './familyTree/familyTreeReducer';

const rootReducer = combineReducers({
  auth: authReducer,
  familyTree: familyTreeReducer,
});

export default rootReducer;