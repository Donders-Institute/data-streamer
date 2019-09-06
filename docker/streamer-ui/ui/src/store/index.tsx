import { createStore, combineReducers, applyMiddleware } from "redux";
import thunkMiddleware from "redux-thunk";
import { composeWithDevTools } from "redux-devtools-extension";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // defaults to localStorage for web
import autoMergeLevel2 from "redux-persist/es/stateReconciler/autoMergeLevel2";
import { systemReducer } from "./system/reducers";
import { calendarsReducer } from "./calendars/reducers";

const rootReducer = combineReducers({
    system: systemReducer,
    calendars: calendarsReducer
});

const persistConfig = {
    key: "root",
    storage,
    stateReconciler: autoMergeLevel2
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export type AppState = ReturnType<typeof rootReducer>;

export default function configureStore() {
    const middlewares = [thunkMiddleware];
    const middleWareEnhancer = applyMiddleware(...middlewares);

    const store = createStore(
        persistedReducer,
        composeWithDevTools(middleWareEnhancer)
    );

    const persistor = persistStore(store);

    return { store, persistor };
}
