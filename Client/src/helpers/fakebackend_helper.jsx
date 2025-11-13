import axios from "axios";
import { del, get, post, put } from "./api_helper";
import * as url from "./url_helper";
import instance from "../utils/axiosInstance";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Gets the logged in user data from local session
const getLoggedInUser = () => {
  const user = localStorage.getItem("user");
  if (user) return JSON.parse(user);
  return null;
};

//is user is logged in
const isUserAuthenticated = () => {
  return getLoggedInUser() !== null;
};

// Register Method
const postFakeRegister = data => {
  return axios
    .post(url.POST_FAKE_REGISTER, data)
    .then(response => {
      if (response.status >= 200 || response.status <= 299) return response.data;
      throw response.data;
    })
    .catch(err => {
      let message;
      if (err.response && err.response.status) {
        switch (err.response.status) {
          case 404:
            message = "Sorry! the page you are looking for could not be found";
            break;
          case 500:
            message =
              "Sorry! something went wrong, please contact our support team";
            break;
          case 401:
            message = "Invalid credentials";
            break;
          default:
            message = err[1];
            break;
        }
      }
      throw message;
    });
};

// Login Method
const postFakeLogin = data => post(url.POST_FAKE_LOGIN, data);

// postForgetPwd
const postFakeForgetPwd = data => post(url.POST_FAKE_PASSWORD_FORGET, data);

// Edit profile
const postJwtProfile = data => post(url.POST_EDIT_JWT_PROFILE, data);

const postFakeProfile = data => post(url.POST_EDIT_PROFILE, data);

// Register Method


//  const postJwtRegister = (endpoint, data) => {
//   // Ensure endpoint starts with a slash
//   const fullUrl = endpoint.startsWith("/") ? `${API_BASE}${endpoint}` : `${API_BASE}/${endpoint}`;

//   console.log("📡 Register API Request URL:", fullUrl); // 👈 Logs actual request URL

//   return axios
//     .post(fullUrl, data)
//     .then(response => {
//       if (response.status >= 200 && response.status <= 299) return response.data; // fixed logic
//       throw response.data;
//     })
//     .catch(err => {
//       let message;
//       if (err.response && err.response.status) {
//         switch (err.response.status) {
//           case 404:
//             message = "Sorry! the page you are looking for could not be found";
//             break;
//           case 500:
//             message = "Sorry! something went wrong, please contact our support team";
//             break;
//           case 401:
//             message = "Invalid credentials";
//             break;
//           default:
//             message = err.message || "Unexpected error occurred";
//             break;
//         }
//       } else {
//         message = err.message || "Network error";
//       }
//       throw message;
//     });
// };


// postJwtRegister using axios instance
const postJwtRegister = async (endpoint, data) => {
  // ensure endpoint starts with a slash
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  // build full URL for logging (instance.defaults.baseURL exists)
  const base = instance.defaults?.baseURL || import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const fullUrl = `${base}${path}`;

  console.log("📡 Register API Request URL:", fullUrl);

  try {
    // use the axios instance (already configured with baseURL + withCredentials)
    const res = await instance.post(path, data, {
      headers: { "Content-Type": "application/json" },
    });

    if (res.status >= 200 && res.status <= 299) return res.data;
    throw res.data;
  } catch (err) {
    // normalize errors similar to your existing helper
    let message = "Network error";
    if (err?.response?.status) {
      switch (err.response.status) {
        case 404:
          message = "Sorry! the page you are looking for could not be found";
          break;
        case 500:
          message = "Sorry! something went wrong, please contact our support team";
          break;
        case 401:
          message = err.response.data?.message || "Invalid credentials";
          break;
        case 400:
          message = err.response.data?.message || "Invalid request";
          break;
        default:
          message = err.response.data?.message || err.message || "Unexpected error occurred";
      }
    } else if (err?.message) {
      message = err.message;
    }
    throw message;
  }
};


const postJwtLogin = async (endpoint, data) => {
  // ensure endpoint starts with a slash
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  // build full URL for logging (instance.defaults.baseURL exists)
  const base = instance.defaults?.baseURL || import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const fullUrl = `${base}${path}`;

  console.log("📡 Register API Request URL:", fullUrl);

  try {
    // use the axios instance (already configured with baseURL + withCredentials)
    const res = await instance.post(path, data, {
      headers: { "Content-Type": "application/json" },
    });

    if (res.status >= 200 && res.status <= 299) return res.data;
    throw res.data;
  } catch (err) {
    // normalize errors similar to your existing helper
    let message = "Network error";
    if (err?.response?.status) {
      switch (err.response.status) {
        case 404:
          message = "Sorry! the page you are looking for could not be found";
          break;
        case 500:
          message = "Sorry! something went wrong, please contact our support team";
          break;
        case 401:
          message = err.response.data?.message || "Invalid credentials";
          break;
        case 400:
          message = err.response.data?.message || "Invalid request";
          break;
        default:
          message = err.response.data?.message || err.message || "Unexpected error occurred";
      }
    } else if (err?.message) {
      message = err.message;
    }
    throw message;
  }
};


// Login Method
// const postJwtLogin = data => post(url.POST_FAKE_JWT_LOGIN, data);

// postForgetPwd
const postJwtForgetPwd = data => post(url.POST_FAKE_JWT_PASSWORD_FORGET, data);

// postSocialLogin
export const postSocialLogin = data => post(url.SOCIAL_LOGIN, data);



export {
  getLoggedInUser,
  isUserAuthenticated,
  postFakeRegister,
  postFakeLogin,
  postFakeProfile,
  postFakeForgetPwd,
  postJwtRegister,
  postJwtLogin,
  postJwtForgetPwd,
  postJwtProfile,
};
