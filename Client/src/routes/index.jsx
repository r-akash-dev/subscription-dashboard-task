import React from "react";
import { Navigate } from "react-router-dom";

// // Authentication related pages
import Login from "../pages/Authentication/Login";
import Logout from "../pages/Authentication/Logout";
import Register from "../pages/Authentication/Register";
import ForgetPwd from "../pages/Authentication/ForgetPassword";

// // Dashboard
import Dashboard from "../pages/Dashboard/index";
import HomePage from "../pages/Home/HomePage";
import Subscription from "../pages/Subscription";
import Subscriptions_List from "../pages/subscriptions_List";


const authProtectedRoutes = [
  { path: "/dashboard", component: <Dashboard /> },
  { path: "/plan", component: <Subscription /> },
   { path: "/subscriptionslist", component: <Subscriptions_List /> },


  { path: "/", exact: true, component: <Navigate to="/dashboard" /> },
];

const publicRoutes = [
  { path: "/logout", component: <Logout /> },
  { path: "/login", component: <Login /> },
  { path: "/forgot-password", component: <ForgetPwd /> },
  { path: "/register", component: <Register /> },
   { path: "/home", component: <HomePage /> },

];

// export { authProtectedRoutes, publicRoutes };
export { authProtectedRoutes, publicRoutes }
