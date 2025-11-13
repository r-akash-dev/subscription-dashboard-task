import PropTypes from "prop-types";
import React from "react";
import { connect } from "react-redux";
import withRouter from "../Common/withRouter";

//i18n
import { withTranslation } from "react-i18next";
import SidebarContent from "./SidebarContent";

import { Link } from "react-router-dom";

import logo from "../../assets/images/logo.svg";
import logoLightPng from "../../assets/images/img.png";
import logoLightSvg from "../../assets/images/img.png";
import logoDark from "../../assets/images/logo-dark.png";

const Sidebar = (props) => {



  return (
    <React.Fragment>
      <div className="vertical-menu">
        <div className="navbar-brand-box">


          <Link to="/" className="logo logo-light d-flex">
            <div
              className="me-2 mt-4 rounded-circle bg-white text-primary d-flex align-items-center justify-content-center"
              style={{ width: 26, height: 26, fontWeight: 700 }}
            >
              SM
            </div >
            <p className="text-white pt-1 ">
              SM
            </p>

            <div>

            </div>
          </Link>
        </div>


        <div data-simplebar className="h-100">
          {props.type !== "condensed" ? <SidebarContent /> : <SidebarContent />}
        </div>

        <div className="sidebar-background"></div>
      </div>
    </React.Fragment>
  );
};

Sidebar.propTypes = {
  type: PropTypes.string,
};

const mapStatetoProps = (state) => {
  return {
    layout: state.Layout,
  };
};
export default connect(
  mapStatetoProps,
  {}
)(withRouter(withTranslation()(Sidebar)));
