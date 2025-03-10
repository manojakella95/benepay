import React, { useEffect } from "react";
import { SnackbarProvider } from "notistack";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from "react-toastify";
import FrameReducer from "./redux/reducer/frame.reducer";
import { createStore } from "redux";
import { Provider } from "react-redux";
import AppFrame from "./components/app-frame/app-frame";
import AppFooter from "./components/app-frame/app-footer/app-footer";

const store = createStore(FrameReducer);

const Root = () => {
  return (
    <Provider store={store}>
      <React.Suspense fallback={<div>loading...</div>}>
        <SnackbarProvider maxSnack={3}>
        <div className="flex flex-col min-h-screen">
            <div className="flex-grow">
              <AppFrame />
            </div>
            <AppFooter /> {/* Add Footer Here */}
          </div>
          
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={true}
          />
        </SnackbarProvider>
      </React.Suspense>
    </Provider>
  );
};

export default Root;
