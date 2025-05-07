import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import { createGlobalStyle } from 'styled-components/macro'
import { BrowserRouter } from 'react-router-dom'
import axios from 'axios'

// Debug logging
const DEBUG = true;
const logDebug = (...args) => DEBUG && console.log('%c[DEBUG]', 'background: #333; color: #bada55', ...args);

// Ghi log khởi động ứng dụng
logDebug('Ứng dụng đang khởi động...', new Date().toLocaleString());
logDebug('Phiên bản React:', React.version);
logDebug('Environment:', process.env.NODE_ENV);

// Log interceptor cho API calls
axios.interceptors.request.use(config => {
  logDebug('🔽 API Request:', config.method?.toUpperCase(), config.url, config.data || '');
  return config;
});

axios.interceptors.response.use(
  response => {
    logDebug('🔼 API Response:', response.status, response.config.url, response.data ? 'Dữ liệu OK' : 'Không có dữ liệu');
    return response;
  },
  error => {
    logDebug('❌ API Error:', error.response?.status || 'Không có response', 
      error.response?.config.url || error.config?.url || 'URL không xác định',
      error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Configure axios defaults
axios.defaults.baseURL = 'http://localhost:8080'
axios.defaults.headers.common['Content-Type'] = 'application/json'
logDebug('Axios đã được cấu hình với baseURL:', axios.defaults.baseURL);

const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
`

ReactDOM.render(
  <BrowserRouter>
    <GlobalStyle />
    <App />
  </BrowserRouter>,
  document.getElementById('root')
)
