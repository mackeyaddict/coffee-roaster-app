import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from "react-router";
import { Provider } from "react-redux";
import { persistStore } from 'redux-persist'
import { store } from './redux/index.js';
import { PersistGate } from 'redux-persist/integration/react';
import { ConfigProvider } from 'antd';
import '@ant-design/v5-patch-for-react-19';

let persistor = persistStore(store);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
        <ConfigProvider
              theme={{
                token: {
                  colorPrimary: "#111111",
                  colorPrimaryBg: "#FFFFFF",
                  colorWarning: "#F7CF28",
                  fontFamily: "Exo 2",
                },
                components: {
                  Timeline: {
                    dotBorderWidth: 5
                  }
                }
              }}
            >
              <App />
            </ConfigProvider>
        </PersistGate>
      </Provider>
    </BrowserRouter>
  </StrictMode>,
)
