// client/src/pages/Admin/subscriptions_List.jsx
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Table,
  Spinner,
  Badge,
  Button,
  Input
} from "reactstrap";

//Import Breadcrumb
import Breadcrumbs from "../../components/Common/Breadcrumb";

//i18n
import { withTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";

import instance from "../../utils/axiosInstance";

const SubscriptionsList = (props) => {
  document.title = "Subscriptions — Admin";

  const navigate = useNavigate();

  // state
  const [loading, setLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [error, setError] = useState("");

  // read auth user from localStorage (you can replace with redux selector)
  const authUser = (() => {
    try { return JSON.parse(localStorage.getItem("authUser") || "null"); }
    catch (e) { return null; }
  })();

  useEffect(() => {
    // client-side guard: redirect non-admins
    if (!authUser || authUser.role !== "admin") {
      // if not logged in, go to login; if logged in but not admin, go to dashboard
      if (!authUser) navigate("/login");
      else navigate("/dashboard");
      return;
    }

    let mounted = true;
    const fetchSubscriptions = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await instance.get("/plans/admin/subscriptions", {
          params: { page, limit: meta.limit, status: statusFilter || undefined }
        });

        if (!mounted) return;

        setSubscriptions(res.data.subscriptions || []);
        setMeta(res.data.meta || { page, limit: meta.limit, total: 0, pages: 0 });
      } catch (err) {
        console.error("Admin subscriptions fetch error:", err);
        const msg = (typeof err === "string") ? err : (err?.response?.data?.message || err?.message || "Failed to load subscriptions");
        if (mounted) setError(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchSubscriptions();
    return () => (mounted = false);
  }, [navigate, page, statusFilter]);

  const handlePrev = () => setPage(Math.max(1, page - 1));
  const handleNext = () => setPage(Math.min(meta.pages || 1, page + 1));

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          {/* Breadcrumb */}
          <Breadcrumbs title={props.t("Admin")} breadcrumbItem={props.t("All Subscriptions")} />

          <Row className="mb-3 align-items-center">
            <Col md={6}>
              <h4 className="mb-0"></h4>
              <p className="text-muted mb-0">List of user subscriptions (admin view).</p>
            </Col>

          
          </Row>

          <Row className="mb-3">
            <Col md={3}>
              <Input type="select" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
                <option value="">All statuses</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="cancelled">Cancelled</option>
              </Input>
            </Col>
          </Row>

          {loading ? (
            <div className="text-center py-5"><Spinner /></div>
          ) : error ? (
            <div className="alert alert-danger">{error}</div>
          ) : (
            <>
              <Table responsive bordered hover className="align-middle">
                <thead>
                  <tr>
                    <th style={{ width: 60 }}>#</th>
                    <th>User</th>
                    <th>Email</th>
                    <th>Plan</th>
                    <th>Start</th>
                    <th>End</th>
                    <th>Status</th>
                    <th>Created</th>
                    
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="text-center text-muted">No subscriptions found</td>
                    </tr>
                  ) : subscriptions.map((s, idx) => (
                    <tr key={s._id || idx}>
                      <td>{(meta.page - 1) * meta.limit + idx + 1}</td>
                      <td>{s.user?.username || "—"}</td>
                      <td>{s.user?.email || "—"}</td>
                      <td>{s.plan?.name || "—"}</td>
                      <td>{s.start_date ? new Date(s.start_date).toLocaleString() : "—"}</td>
                      <td>{s.end_date ? new Date(s.end_date).toLocaleString() : "—"}</td>
                      <td>
                        <Badge color={s.status === "active" ? "success" : s.status === "expired" ? "secondary" : "warning"}>
                          {s.status}
                        </Badge>
                      </td>
                      <td>{s.createdAt ? new Date(s.createdAt).toLocaleString() : "—"}</td>
                     
                    </tr>
                  ))}
                </tbody>
              </Table>

              <div className="d-flex justify-content-between align-items-center">
                <div className="text-muted">Showing {subscriptions.length} of {meta.total}</div>
                <div>
                  <Button color="primary" size="sm" className="me-2" onClick={handlePrev} disabled={page <= 1}>Prev</Button>
                  <Button color="primary" size="sm" onClick={handleNext} disabled={page >= (meta.pages || 1)}>Next</Button>
                </div>
              </div>
            </>
          )}
        </Container>
      </div>
    </React.Fragment>
  );
};

SubscriptionsList.propTypes = {
  t: PropTypes.any,
};

export default withTranslation()(SubscriptionsList);
