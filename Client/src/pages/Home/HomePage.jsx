import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useSelector } from 'react-redux';
// main.jsx or index.js
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // 👈 this enables navbar collapse/offcanvas


const fallbackPlans = [
    { _id: "starter", name: "Starter", price: 0, priceLabel: "Free", features: ["1 project", "Basic Learn", "Basic Support"], duration: 30 },
    { _id: "pro", name: "Pro", price: 9.99, priceLabel: "$9.99/mo", features: ["10 projects", "Email Support", "Analytics"], duration: 30 },
    { _id: "business", name: "Business", price: 29.99, priceLabel: "$29.99/mo", features: ["Unlimited", "Priority Support", "Team Access"], duration: 30 },
];





const HomePage = () => {
  const navigate = useNavigate();
  const auth = useSelector?.((s) => s.auth) ?? { user: null };
  const user = auth.user ?? null;

  const [plans, setPlans] = useState(fallbackPlans);
  const [loadingPlans, setLoadingPlans] = useState(true);
  

    useEffect(() => {
          let mounted = true;
          const fetchPlans = async () => {
              try {
                  const res = await instance.get("/plans"); // maps to API_BASE + /plans
                  if (mounted && res?.data?.plans) {
                      setPlans(res.data.plans);
                      console.log("res", res.data)
                  }
              } catch (err) {
                  // keep fallback plans if API fails
                  console.warn("Could not fetch plans, using fallback.", err);
              } finally {
                  if (mounted) setLoadingPlans(false);
              }
          };
          fetchPlans();
          return () => (mounted = false);
      }, []);
  

  const hideOffcanvas = () => {
    const off = document.getElementById('mobileOffcanvas');
    setShowPlans(!showPlans)
    if (!off) return;

    const bs = window.bootstrap;
    if (bs) {

      const oc = bs.Offcanvas.getOrCreateInstance(off);
      oc.hide();
    }
  };

  //  useEffect(() => {
  //   const token = localStorage.getItem("accessToken");
  //   if (token) {
  //     navigate("/dashboard");
  //   }
  // }, [navigate]);
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      window.location.href = "/dashboard";
    }
  }, []);

  const [showPlans, setShowPlans] = useState(false);
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [hash, showPlans]);

 
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState("");

  const handleClick = () => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      setModalContent("Please register or login to choose a plan.");
    } else {
      setModalContent("You have already subscribed!");
    }

    setShowModal(true);
  };



  return (
    <div className="bg-light text-dark">
      {/* Navbar */}



      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm"
        style={{ background: "linear-gradient(90deg, #1dca93ff 0%, #0f4a85ff 100%)" }}
      >
        <div className="container">
          <Link className="navbar-brand fw-bold d-flex align-items-center" to="/">
            <div
              className="me-2 rounded-circle bg-white text-primary d-flex align-items-center justify-content-center"
              style={{ width: 36, height: 36, fontWeight: 700 }}
            >
              SM
            </div>
            <span>Subscription Dashboard</span>
          </Link>

          {/* Offcanvas toggler visible on mobile */}
          <button
            className="btn d-lg-none btn-outline-light"
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#mobileOffcanvas"
            aria-controls="mobileOffcanvas"
            aria-label="Open menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-list" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M2 12.5a.5.5 0 010-1h12a.5.5 0 010 1H2zm0-4a.5.5 0 010-1h12a.5.5 0 010 1H2zm0-4a.5.5 0 010-1h12a.5.5 0 010 1H2z" />
            </svg>
          </button>

          {/* Desktop nav */}
          <div className="collapse navbar-collapse d-none d-lg-flex" id="navbarNav">
            <ul className="navbar-nav ms-auto align-items-center">
              <li className="nav-item">
                <Link className="nav-link" to="/home#plans" onClick={() => setShowPlans(!showPlans)}>Plans</Link>
              </li>
        
                <>
                  <li className="nav-item">
                    <Link className="btn btn-light text-primary ms-3" to="/login">Login</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="btn btn-outline-light ms-2" to="/register">Sign Up</Link>
                  </li>
                </>
          
            </ul>
          </div>
        </div>
      </nav>

      {/* Offcanvas panel for mobile */}
      <div
        className="offcanvas offcanvas-start"
        tabIndex="-1"
        id="mobileOffcanvas"
        aria-labelledby="mobileOffcanvasLabel"
      >
        <div className="offcanvas-header">
          <h5 className="offcanvas-title" id="mobileOffcanvasLabel">Menu</h5>
          <button type="button" className="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>

        <div className="offcanvas-body">
          <nav className="nav flex-column">
            {/* data-bs-dismiss ensures the offcanvas closes when a link is clicked */}
            <Link className="nav-link py-2" to="/home#plans" data-bs-dismiss="offcanvas" onClick={hideOffcanvas}>Plans</Link>
           

           

            <hr />

            {!user ? (
              <>
                <Link className="btn btn-primary w-100 mb-2" to="/login" data-bs-dismiss="offcanvas" onClick={hideOffcanvas}>Login</Link>
                <Link className="btn btn-outline-primary w-100" to="/register" data-bs-dismiss="offcanvas" onClick={hideOffcanvas}>Sign Up</Link>
              </>
            ) : (
              <>
                <div className="mb-3">
                  <strong>{user.name}</strong>
                  <div className="text-muted small">{user.email}</div>
                </div>

                <Link className="btn btn-outline-secondary w-100 mb-2" to="/dashboard" data-bs-dismiss="offcanvas" onClick={hideOffcanvas}>Go to Dashboard</Link>

                {/* Logout (wire this to your auth logic) */}
                <button
                  className="btn btn-danger w-100"
                  onClick={() => {
                    // TODO: call your logout logic here (e.g. dispatch(logout()))
                    // After logout hide offcanvas:
                    hideOffcanvas();

                  }}
                >
                  Logout
                </button>
              </>
            )}
          </nav>

          <div className="mt-4 text-center small text-muted">© {new Date().getFullYear()} Subscription Dashboard</div>
        </div>
      </div>

      {/* Hero Section */}
      <header className="py-5 bg-dark text-white"
        // style={{ background: "linear-gradient(90deg, #6ca7e7ff, #fd59daff)" }}
        style={{ background: "linear-gradient(90deg, #56dab0ff 0%, #337bc2ff 100%)" }}

      >
        <div className="container text-center py-5">
          <h1 className="display-4 fw-bold">Manage Your Subscriptions Easily</h1>
          <p className="lead mb-4">
            A simple and elegant way to handle your SaaS plans, users, and billing.
          </p>
          <Link className="btn btn-light btn-lg text-primary fw-semibold me-3"
            to="/home#plans"
            onClick={() => setShowPlans(!showPlans)}

          >
            View Plans
          </Link>
          <Link to="/register" className="btn btn-outline-light btn-lg fw-semibold">
            Get Started
          </Link>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-5">
        <div className="container text-center">
          <h2 className="fw-bold mb-4">Why Choose Our Dashboard?</h2>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body">
                  <div className="text-primary fs-1 mb-3">
                    <i className="bi bi-shield-lock"></i>
                  </div>
                  <h5 className="card-title">Secure Authentication</h5>
                  <p className="card-text">
                    Manage user access securely with JWT tokens and role-based authorization.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body">
                  <div className="text-primary fs-1 mb-3">
                    <i className="bi bi-bar-chart-line"></i>
                  </div>
                  <h5 className="card-title">Analytics Dashboard</h5>
                  <p className="card-text">
                    View all your active plans, users, and subscription statuses in one place.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body">
                  <div className="text-primary fs-1 mb-3">
                    <i className="bi bi-lightning-charge"></i>
                  </div>
                  <h5 className="card-title">Fast & Responsive</h5>
                  <p className="card-text">
                    Built with React and Bootstrap for blazing-fast and mobile-friendly UI.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Plans Preview */}
      <section className="py-5 bg-light" id="plans">
        <div className="container text-center">
          <h2 className="fw-bold mb-4">Our Plans</h2>
          <div className="row g-4">
            {[
              { name: "Starter", price: "Free", features: ["1 project", "Basic Learn", "Basic Support"] },
              { name: "Pro", price: "$9.99/mo", features: ["10 projects", "Email Support", "Analytics"] },
              { name: "Business", price: "$29.99/mo", features: ["Unlimited", "Priority Support", "Team Access"] },
            ].map((plan, i) => (
              <div className="col-md-4" key={i}>
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body">
                    <h5 className="card-title fw-bold">{plan.name}</h5>
                    <h6 className="text-muted mb-3">{plan.price}</h6>
                    <ul className="list-unstyled mb-4">
                      {plan.features.map((f, idx) => (
                        <li key={idx} className="mb-2">
                          <i className="bi bi-check-circle text-success me-2"></i>{f}
                        </li>
                      ))}
                    </ul>
                    <Link 
                      onClick={handleClick}
                     className="btn w-100 text-white"
                      style={{ background: "linear-gradient(90deg, #56dab0ff 0%, #337bc2ff 100%)" }}
                    >
                      Choose Plan
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


       {/* Popup Modal */}
      {showModal && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Notice</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <h6>{modalContent}</h6>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                 onClick={() => {
                      setShowModal(false);
                      navigate("/register"); // 👈 change to "/login" if needed
                    }}
                  style={{ background: "linear-gradient(90deg, #1dca93ff 0%, #0f4a85ff 100%)" }}
                >
                  Login / register
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Testimonials */}
      <section className="py-5 bg-white">
        <div className="container text-center">
          <h2 className="fw-bold mb-4">What Our Users Say</h2>
          <div className="row g-4">
            {[
              { name: "Akash R", text: "The dashboard is smooth and well-built. Loved the simplicity!" },
              { name: "Priya", text: "Great UI and easy to manage our team subscriptions." },
              { name: "Ravi", text: "Perfect for startups — setup was super fast." },
            ].map((t, i) => (
              <div className="col-md-4" key={i}>
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body">
                    <p className="card-text fst-italic">"{t.text}"</p>
                    <h6 className="mt-3 text-primary fw-bold">{t.name}</h6>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className=" text-white py-4"
        style={{ background: "linear-gradient(90deg, #56dab0ff 0%, #337bc2ff 100%)" }}>
        <div className="container text-center">
          <p className="mb-1">© {new Date().getFullYear()} Subscription Dashboard</p>

        </div>
      </footer>
    </div>
  );
};

export default HomePage;
