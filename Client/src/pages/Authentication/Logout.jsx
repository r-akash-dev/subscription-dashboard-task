import React, { useEffect } from "react";
import PropTypes from "prop-types";
import withRouter from "../../components/Common/withRouter";
import { logoutUser } from "/src/store/actions";

//redux
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

const Logout = () => {
  const history = useNavigate();
  const dispatch = useDispatch();

  //   useEffect(() => {
  //   // clear token and dispatch logout action
  //   localStorage.removeItem("accessToken");
  //   dispatch(logoutUser());

  //   // redirect to login after logout
  //   history("/home");
  //   dispatch(logoutUser(history));
  // }, [dispatch, history]);

   useEffect(() => {
    // 1️⃣ Clear stored tokens or user data
    localStorage.removeItem("accessToken");
    localStorage.removeItem("authUser");

    // 2️⃣ Dispatch redux logout action
     dispatch(logoutUser(history));

    // 3️⃣ Redirect to home & reload page
    window.location.href = "/home";
   
  }, [dispatch]);

 
  return <></>;
};

Logout.propTypes = {
  history: PropTypes.object,
};

export default withRouter(Logout);
