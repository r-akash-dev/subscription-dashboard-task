import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import {
    Container
} from "reactstrap";

//Import Breadcrumb
import Breadcrumbs from "../../components/Common/Breadcrumb";

//i18n
import { withTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";

import instance from "../../utils/axiosInstance"; 

const fallbackPlans = [
    { _id: "starter", name: "Starter", price: 0, priceLabel: "Free", features: ["1 project", "Basic Learn", "Basic Support"], duration: 30 },
    { _id: "pro", name: "Pro", price: 9.99, priceLabel: "$9.99/mo", features: ["10 projects", "Email Support", "Analytics"], duration: 30 },
    { _id: "business", name: "Business", price: 29.99, priceLabel: "$29.99/mo", features: ["Unlimited", "Priority Support", "Team Access"], duration: 30 },
];

const Subscription = (props) => {

    //meta title
    document.title = "Dashboard";




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

    const [plans, setPlans] = useState(fallbackPlans);
    const [loadingPlans, setLoadingPlans] = useState(true);

    const [mySubscription, setMySubscription] = useState(null); // subscription object or null
    const [loadingSub, setLoadingSub] = useState(true);

    // fetch plans from backend (GET /api/plans)
    useEffect(() => {
        let mounted = true;
        const fetchPlans = async () => {
            try {
                const res = await instance.get("/plans"); // maps to API_BASE + /plans
                if (mounted && res?.data?.plans) {
                    setPlans(res.data.plans);
                   
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


    

    // fetch current user's subscription (GET /plans/my-subscription)
    useEffect(() => {
        let mounted = true;
        const fetchSubscription = async () => {
            setLoadingSub(true);
            try {
                const res = await instance.get("/plans/my-subscription");
                // expected: { subscription: null } or { subscription: { plan: {...}, ... } }
                if (mounted) setMySubscription(res.data.subscription || null);
            } catch (err) {
                // if unauthorized or network error, just keep null
                console.warn("Could not fetch my subscription", err);
                if (mounted) setMySubscription(null);
            } finally {
                if (mounted) setLoadingSub(false);
            }
        };
        fetchSubscription();
        return () => (mounted = false);
    }, []);

    // helper: is user logged in?
    const isLoggedIn = () => !!localStorage.getItem("accessToken");

    // subscribe handler
    const handleSubscribe = async (plan) => {
        // if not logged in -> prompt to login/register
        if (!isLoggedIn()) {
            setModalContent("You must be logged in to subscribe. Please login or register first.");
            setShowModal(true);
            return;
        }

        // if already subscribed to this plan
        if (mySubscription && mySubscription.plan && (mySubscription.plan._id === plan._id || mySubscription.plan === plan._id)) {
            setModalContent("You already have this plan active.");
            setShowModal(true);
            return;
        }

        try {
            // call subscribe endpoint - POST /plans/subscribe/:planId
            // note: backend route mounted at /api/plans/subscribe/:planId, axiosInstance baseURL is .../api
            const res = await instance.post(`/plans/subscribe/${plan._id}`);
            // expected response: { subscription: { ... } }
            const subscription = res.data.subscription || null;
            setMySubscription(subscription);
            setModalContent("Subscription successful! Redirecting to Dashboard...");
            setShowModal(true);

            // give user a moment then redirect or update UI
            setTimeout(() => {
                setShowModal(false);
                // full reload redirect (optional) or use client-side navigation:
                window.location.href = "/dashboard";
            }, 1200);
        } catch (err) {
            // err is normalized by your helper / instance interceptors or a string
            const message = typeof err === "string" ? err : (err?.response?.data?.message || err?.message || "Subscription failed");
            setModalContent(message);
            setShowModal(true);
        }
    };

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    {/* Render Breadcrumb */}
                    <Breadcrumbs
                        title={props.t("Subscription Plan")}
                        breadcrumbItem={props.t("Subscription Plan")} />

                    <section className="py-5 bg-light" id="plans">
                        <div className="container text-center">
                            <h2 className="fw-bold mb-4">Our Plans</h2>

                            {loadingPlans ? (
                                <div className="mb-4">Loading plans…</div>
                            ) : (
                                <div className="row g-4">
                                    {plans.map((plan, i) => {
                                        // determine if this plan is active for the user
                                        const activePlanId = mySubscription?.plan?._id || mySubscription?.plan;
                                        const isActive = !!(activePlanId && (activePlanId.toString() === plan._id.toString()));

                                        return (
                                            <div className="col-md-4" key={plan._id || i}>
                                                <div className="card h-100 border-0 shadow-sm">
                                                    <div className="card-body d-flex flex-column">
                                                        <div className="d-flex justify-content-between align-items-start">
                                                            <h5 className="card-title fw-bold">{plan.name}</h5>
                                                            {isActive && <span className="badge bg-success">Active</span>}
                                                        </div>

                                                        <h6 className="text-muted mb-3">{plan.priceLabel || (plan.price === 0 ? "Free" : `$${plan.price}/mo`)}</h6>

                                                        <ul className="list-unstyled mb-4 text-start">
                                                            {plan.features?.map((f, idx) => (
                                                                <li key={idx} className="mb-2">
                                                                    <i className="bi bi-check-circle text-success me-2"></i>
                                                                    {f}
                                                                </li>
                                                            ))}
                                                        </ul>

                                                        <div className="mt-auto">
                                                            {/* if loading subscription info, show disabled */}
                                                            <button
                                                                className="btn w-100 text-white"
                                                                style={{ background: "linear-gradient(90deg, #56dab0ff 0%, #337bc2ff 100%)" }}
                                                                onClick={() => handleSubscribe(plan)}
                                                                disabled={loadingSub || isActive}
                                                            >
                                                                {loadingSub ? "Checking..." : isActive ? "Current Plan" : "Choose Plan"}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </section>


                    {/* Popup Modal */}
                    {showModal && (
                        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                            <div className="modal-dialog modal-dialog-centered">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title">Notice</h5>
                                        <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                                    </div>
                                    <div className="modal-body">
                                        <h6>{modalContent}</h6>
                                    </div>
                                    <div className="modal-footer">
                                        <button
                                            className="btn btn-secondary"
                                            onClick={() => {
                                                setShowModal(false);
                                            }}
                                            style={{ background: "linear-gradient(90deg, #1dca93ff 0%, #0f4a85ff 100%)" }}
                                        >
                                            OK
                                        </button>
                                        {!isLoggedIn() && (
                                            <Link to="/login" className="btn btn-outline-primary" onClick={() => setShowModal(false)}>
                                                Login
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </Container>
            </div>

        </React.Fragment>
    );
};

Subscription.propTypes = {
    t: PropTypes.any,
    chartsData: PropTypes.any,
    onGetChartsData: PropTypes.func,
};

export default withTranslation()(Subscription);
