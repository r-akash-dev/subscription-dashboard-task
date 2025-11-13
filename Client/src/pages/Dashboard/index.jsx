// client/src/pages/Dashboard/Dashboard.jsx
import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Button,
  Badge,
  Spinner,
} from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import instance from "../../utils/axiosInstance"; // your axios instance
import { useNavigate } from "react-router-dom";
import { withTranslation } from "react-i18next";

function formatDate(d) {
  if (!d) return "-";
  const dt = new Date(d);
  return dt.toLocaleDateString();
}

const Dashboard = (props) => {
  document.title = "Dashboard";

  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null); // null or subscription object
  const [plansLoading, setPlansLoading] = useState(false);
  const [error, setError] = useState("");


  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState("");
  const [recentSubs, setRecentSubs] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, expired: 0, plansCount: 0 });
  const [activityLog, setActivityLog] = useState([]);
  const [loadingAdmin, setLoadingAdmin] = useState(true); // ✅ Add this line



  const [role, setrole] = useState("");

  useEffect(() => {
    if (localStorage.getItem("authUser")) {
      if (import.meta.env.VITE_APP_DEFAULTAUTH === "firebase") {
        const obj = JSON.parse(localStorage.getItem("authUser"));

      } else if (
        import.meta.env.VITE_APP_DEFAULTAUTH === "fake" ||
        import.meta.env.VITE_APP_DEFAULTAUTH === "jwt"
      ) {
        const obj = JSON.parse(localStorage.getItem("authUser"));

        setrole(obj.role)
      }
    }
  }, [props.success]);



  // useEffect(() => {
  //   let mounted = true;
  //   const fetchSubscription = async () => {
  //     setLoading(true);
  //     try {
  //       const res = await instance.get("/plans/my-subscription");
  //       // expected: { subscription: null } or { subscription: {..., plan: {...}} }
  //       if (!mounted) return;
  //       setSubscription(res.data.subscription || null);

  //       const subs = res.data.subscriptions || [];

  //     // ✅ 2. Compute simple stats
  //     const total = subs.length;
  //     const active = subs.filter(s => s.status === "active").length;
  //     const expired = subs.filter(s => s.status === "expired").length;

  //     // ✅ 3. Fetch plan count (if backend includes plans in res)
  //     const plansCount = new Set(subs.map(s => s.plan?._id)).size;

  //     // ✅ 4. Sort recent subscriptions (latest 5)
  //     const sorted = [...subs].sort(
  //       (a, b) => new Date(b.start_date) - new Date(a.start_date)
  //     );
  //     const recent = sorted.slice(0, 5);

  //     // ✅ 5. Set all states
  //     setStats({ total, active, expired, plansCount });
  //     setRecentSubs(recent);
  //     setActivityLog(recent.map(s => ({
  //       user: s.user?.username,
  //       plan: s.plan?.name,
  //       status: s.status,
  //       start: s.start_date,
  //     })));

  //     setAdminError("");

  //     } catch (err) {
  //       console.warn("Failed to fetch subscription:", err);
  //       if (mounted) setError(typeof err === "string" ? err : "Failed to load subscription");
  //     } finally {
  //       if (mounted) setLoading(false);
  //     }
  //   };

  //   fetchSubscription();
  //   return () => (mounted = false);
  // }, []);



  // fetch user subscription + admin data (if admin)
  useEffect(() => {
    let mounted = true;

    const fetchUserSubscription = async () => {
      try {
        const res = await instance.get("/plans/my-subscription");
        if (!mounted) return;
        // res.data.subscription => null or a subscription object (not an array)
        setSubscription(res.data.subscription || null);
      } catch (err) {
        console.warn("Failed to fetch subscription:", err);
        if (mounted) setError(typeof err === "string" ? err : "Failed to load subscription");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    const fetchAdminData = async () => {
      setAdminLoading(true);
      setAdminError("");
      try {
        // IMPORTANT: call admin endpoint that returns populated user & plan
        // endpoint: GET /api/plans/admin/subscriptions (axiosInstance baseURL already has /api)
        const res = await instance.get("/plans/admin/subscriptions", { params: { page: 1, limit: 50 } });
        if (!mounted) return;

        // res.data.subscriptions should be an array (populated with user & plan)
        const subs = Array.isArray(res.data.subscriptions) ? res.data.subscriptions : [];

        // compute stats (use all subs if meta.total not provided)
        const total = res.data.meta?.total ?? subs.length;
        const active = subs.filter(s => s.status === "active").length;
        const expired = subs.filter(s => s.status === "expired").length;
        const plansCount = new Set(subs.map(s => s.plan?._id || s.plan)).size;

        // sort by start_date desc and take top 6
        const sorted = subs.slice().sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
        const recent = sorted.slice(0, 6);

        // build activity log strings (safe access)
        const activity = recent.map(s => {
          const username = s.user?.username || s.user?.email || s.user || "Unknown";
          const planName = s.plan?.name || "—";
          return `${username} subscribed to ${planName} (${s.status})`;
        });

        console.log(total, "total")

        setStats({ total, active, expired, plansCount });
        setRecentSubs(recent);
        setActivityLog(activity);
      } catch (err) {
        console.error("Admin dashboard fetch error:", err);
        setAdminError(typeof err === "string" ? err : (err?.response?.data?.message || "Failed to load admin data"));
      } finally {
        if (mounted) {
          setLoadingAdmin(false)
          setAdminLoading(false);
        }
          
      }
    };

    // run user fetch always
    fetchUserSubscription();

    // run admin fetch only when role === 'admin'
    if (role === "admin") {
      fetchAdminData();
    } else {
      // not admin -> make sure admin loading is false
      setAdminLoading(false);
    }

    return () => { mounted = false; };
  }, [role]); // re-run when role changes







  // Handler: go to Plans page (or open manage modal)
  const handleManage = () => {
    navigate("/plan");
  };

  // Handler: view more details
  const handleDetails = () => {
    navigate("/dashboard/details"); // implement route if you want
  };

  // Derived values
  const isActive = subscription && subscription.status === "active";
  const planName = subscription?.plan?.name || "No active plan";
  const startDate = subscription?.start_date ? formatDate(subscription.start_date) : "-";
  const endDate = subscription?.end_date ? formatDate(subscription.end_date) : "-";


  return (
    <React.Fragment>
      <div className="page-content">


        {role == "user" &&

          <Container fluid>
            <Breadcrumbs title={props.t("Dashboards")} breadcrumbItem={props.t("Dashboard")} />

            <Row className="mb-4">
              <Col md={8}>
                <h3 className="mb-1">Welcome back{ /* you could show user name here */}</h3>
                <p className="text-muted">Here's a quick overview of your subscription and activity.</p>
              </Col>

              <Col md={4} className="d-flex align-items-center justify-content-md-end">
                <Button color="primary" onClick={() => navigate("/plan")} className="me-2">
                  Explore Plans
                </Button>

              </Col>
            </Row>

            {/* top cards */}
            <Row className="g-3 mb-4">
              <Col md={4}>
                <Card className="h-100 border-0 shadow-sm">
                  <CardBody>
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h6 className="text-muted mb-1">Current Plan</h6>
                        {loading ? (
                          <div className="d-flex align-items-center">
                            <Spinner size="sm" /> <span className="ms-2">Loading...</span>
                          </div>
                        ) : (
                          <h5 className="fw-bold mb-0">{planName}</h5>
                        )}
                      </div>

                      <div>
                        {isActive ? (
                          <Badge color="success" pill>Active</Badge>
                        ) : subscription ? (
                          <Badge color="secondary" pill>{subscription.status}</Badge>
                        ) : (
                          <Badge color="warning" pill>None</Badge>
                        )}
                      </div>
                    </div>

                    <hr />

                    <div className="d-flex justify-content-between small text-muted">
                      <div>
                        <div className="mb-1">Start</div>
                        <div>{startDate}</div>
                      </div>
                      <div>
                        <div className="mb-1">End</div>
                        <div>{endDate}</div>
                      </div>
                      <div>
                        <div className="mb-1">Plan duration</div>
                        <div>{subscription?.plan?.duration ? `${subscription.plan.duration} days` : "-"}</div>
                      </div>
                    </div>

                    <div className="mt-3 d-flex gap-2">
                      <Button color="primary" onClick={handleManage} disabled={loading}>
                        {isActive ? "Manage Plan" : "Subscribe"}
                      </Button>

                    </div>
                  </CardBody>
                </Card>
              </Col>

              <Col md={4}>
                <Card className="h-100 border-0 shadow-sm">
                  <CardBody>
                    <h6 className="text-muted mb-2">Projects Used</h6>
                    {/* This is a placeholder — replace with real data */}
                    <div className="d-flex align-items-center justify-content-between">
                      <div>
                        <h4 className="mb-0">3 / 10</h4>
                        <small className="text-muted">Active projects</small>
                      </div>
                      <div style={{ width: 100 }}>
                        {/* simple progress circle substitute using bootstrap progress */}
                        <div className="progress" style={{ height: 8 }}>
                          <div className="progress-bar" role="progressbar" style={{ width: "30%" }}></div>
                        </div>
                      </div>
                    </div>

                    <hr />
                    <small className="text-muted">Upgrade to increase project limits.</small>
                  </CardBody>
                </Card>
              </Col>

              <Col md={4}>
                <Card className="h-100 border-0 shadow-sm">
                  <CardBody>
                    <h6 className="text-muted mb-2">Support</h6>
                    <h5 className="fw-bold">Standard</h5>
                    <p className="small text-muted">Contact Support response immediately</p>
                    <div className="mt-3">
                      <div className="mt-3">
                        <Button
                          color="outline-primary"
                          tag="a"
                          href="tel:+918608841928"
                          style={{ textDecoration: "none" }}
                        >
                          <b>📞 +91 86088 41928</b>
                        </Button>
                      </div>

                    </div>
                  </CardBody>
                </Card>
              </Col>
            </Row>

            {/* Detailed Area */}
            <Row>
              <Col lg={8}>
                <Card className="border-0 shadow-sm mb-3">
                  <CardBody>
                    <h5 className="mb-3">Subscription Details</h5>

                    {loading ? (
                      <div className="py-5 text-center"><Spinner /></div>
                    ) : subscription ? (
                      <div>
                        <p><strong>Plan:</strong> {subscription.plan?.name}</p>
                        <p><strong>Status:</strong> <Badge color={isActive ? "success" : "secondary"}>{subscription.status}</Badge></p>
                        <p><strong>Start date:</strong> {startDate}</p>
                        <p><strong>End date:</strong> {endDate}</p>
                        <p><strong>Features:</strong></p>
                        <ul>
                          {subscription.plan?.features?.map((f, idx) => <li key={idx}>{f}</li>)}
                        </ul>
                      </div>
                    ) : (
                      <div>
                        <p className="text-muted">You don't have an active plan yet.</p>
                        <Button
                          color="primary"
                          onClick={() => navigate("/plan")}>Choose a Plan</Button>
                      </div>
                    )}
                  </CardBody>
                </Card>
              </Col>

              <Col lg={4}>
                <Card className="border-0 shadow-sm mb-3">
                  <CardBody>
                    <h6 className="mb-3">Quick Actions</h6>
                    <div className="d-grid gap-2">
                      <Button color="primary" onClick={() => navigate("/plan")}>Upgrade / Change Plan</Button>

                      <Button color="outline-danger" onClick={() => {
                        // perform logout or go to logout route
                        localStorage.removeItem("accessToken");
                        localStorage.removeItem("authUser");
                        window.location.href = "/logout";

                      }}>Logout</Button>
                    </div>
                  </CardBody>
                </Card>
              </Col>
            </Row>

          </Container>

        }


        {role == "admin" && (
          <Container fluid>
            <Breadcrumbs title={props.t("Admin Dashboard")} breadcrumbItem={props.t("Admin")} />

            <Row className="mb-4">
              <Col md={8}>
                <h3 className="mb-1">Admin Console</h3>
                <p className="text-muted">Overview of subscriptions, users and quick actions.</p>
              </Col>

              <Col md={4} className="d-flex align-items-center justify-content-md-end">
                <Button color="primary" onClick={() => navigate("/plan")} className="me-2">
                  Manage Subscriptions
                </Button>

              </Col>
            </Row>

            {/* Top Metrics */}
            <Row className="g-3 mb-4">
              <Col md={3}>
                <Card className="h-100 border-0 shadow-sm">
                  <CardBody>
                    <h6 className="text-muted mb-2">Total Subscriptions</h6>
                    <h3 className="fw-bold">{/* total */}{loadingAdmin ? <Spinner size="sm" /> : stats.total}</h3>
                    <small className="text-muted">All time</small>
                  </CardBody>
                </Card>
              </Col>

              <Col md={3}>
                <Card className="h-100 border-0 shadow-sm">
                  <CardBody>
                    <h6 className="text-muted mb-2">Active</h6>
                    <h3 className="fw-bold">{loadingAdmin ? <Spinner size="sm" /> : stats.active}</h3>
                    <small className="text-muted">Currently active</small>
                  </CardBody>
                </Card>
              </Col>

              <Col md={3}>
                <Card className="h-100 border-0 shadow-sm">
                  <CardBody>
                    <h6 className="text-muted mb-2">Expired</h6>
                    <h3 className="fw-bold">{loadingAdmin ? <Spinner size="sm" /> : stats.expired}</h3>
                    <small className="text-muted">Past end date</small>
                  </CardBody>
                </Card>
              </Col>

              <Col md={3}>
                <Card className="h-100 border-0 shadow-sm">
                  <CardBody>
                    <h6 className="text-muted mb-2">Plans</h6>
                    <h3 className="fw-bold">{loadingAdmin ? <Spinner size="sm" /> : stats.plansCount}</h3>
                    <small className="text-muted">Available plans</small>
                  </CardBody>
                </Card>
              </Col>
            </Row>

            {/* Recent subscriptions preview + quick actions */}
            <Row className="mb-4">
              <Col lg={8}>
                <Card className="border-0 shadow-sm mb-3">
                  <CardBody>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5 className="mb-0">Recent Subscriptions</h5>
                      <div>
                        <Button color="link" onClick={() => navigate("/subscriptionslist")}>View all</Button>
                      </div>
                    </div>

                    {adminError ? (
                      <div className="alert alert-danger">{adminError}</div>
                    ) : adminLoading ? (
                      <div className="py-4 text-center"><Spinner /></div>
                    ) : recentSubs.length === 0 ? (
                      <div className="text-center text-muted py-4">No subscriptions found</div>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>User</th>
                              <th>Email</th>
                              <th>Plan</th>
                              <th>Start</th>
                              <th>End</th>
                              <th>Status</th>
                             
                            </tr>
                          </thead>
                          <tbody>
                            {recentSubs.map((s, i) => (
                              <tr key={s._id || i}>
                                <td>{i + 1}</td>
                                <td>{s.user?.username || "—"}</td>
                                <td>{s.user?.email || "—"}</td>
                                <td>{s.plan?.name || "—"}</td>
                                <td>{s.start_date ? new Date(s.start_date).toLocaleDateString() : "—"}</td>
                                <td>{s.end_date ? new Date(s.end_date).toLocaleDateString() : "—"}</td>
                                <td>
                                  <Badge color={s.status === "active" ? "success" : s.status === "expired" ? "secondary" : "warning"}>
                                    {s.status}
                                  </Badge>
                                </td>
                                
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardBody>
                </Card>
              </Col>

              <Col lg={4}>


                <Card className="border-0 shadow-sm">
                  <CardBody>
                    <h6 className="mb-3">Recent Activity</h6>
                    <div className="small text-muted">
                      <ul className="mb-0">
                        {activityLog.length === 0 ? (
                          <li>No recent activity</li>
                        ) : (
                          activityLog.map((a, idx) => <li key={idx}>{a}</li>)
                        )}
                      </ul>
                    </div>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </Container>
        )}

      </div>
    </React.Fragment>
  );
};

Dashboard.propTypes = {
  t: PropTypes.any,
};

export default withTranslation()(Dashboard);
