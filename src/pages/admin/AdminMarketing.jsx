import { useEffect, useMemo, useState } from "react";
import {
  FiActivity,
  FiArrowDownRight,
  FiArrowUpRight,
  FiBarChart2,
  FiCalendar,
  FiCheckCircle,
  FiEdit2,
  FiEye,
  FiFilter,
  FiMail,
  FiMoreHorizontal,
  FiMousePointer,
  FiPause,
  FiPlay,
  FiPlus,
  FiSearch,
  FiTarget,
  FiTrash2,
  FiTrendingUp,
  FiUsers,
  FiVolume2, // Replaced FiMegaphone with FiVolume2
  FiX,
} from "react-icons/fi";

import {
  onValue,
  ref,
  push,
  set,
  update,
  remove,
} from "firebase/database";

import { db } from "../../services/firebase";
import "./AdminMarketing.css";

const CHANNELS = ["Instagram", "Facebook", "Email", "Google", "TikTok", "Other"];

const EMPTY_FORM = {
  name: "",
  channel: "Instagram",
  status: "active",
  budget: "",
  reach: "",
  clicks: "",
  conversions: "",
  startDate: "",
  endDate: "",
};

const money = (value) =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const number = (value) =>
  new Intl.NumberFormat("en-PK").format(Number(value) || 0);

const dateValue = (value) => {
  if (!value) return null;

  if (typeof value === "object" && value.seconds) {
    return new Date(value.seconds * 1000);
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const getOrderDate = (order) =>
  dateValue(
    order.createdAt ||
      order.orderDate ||
      order.date ||
      order.timestamp
  );

const getOrderAmount = (order) =>
  Number(
    order.totalAmount ??
      order.grandTotal ??
      order.total ??
      order.amount ??
      0
  ) || 0;

const isRevenueOrder = (order) => {
  const status = String(order.status || "").toLowerCase();
  const payment = String(order.paymentStatus || "").toLowerCase();

  return (
    !["cancelled", "canceled", "refunded", "failed"].includes(status) &&
    !["cancelled", "canceled", "refunded", "failed"].includes(payment)
  );
};

const getCampaignOrders = (orders, campaignId) =>
  orders.filter(
    (order) =>
      String(order.campaignId || order.marketingCampaignId || "") ===
        String(campaignId) && isRevenueOrder(order)
  );

function LineChart({ data }) {
  const width = 700;
  const height = 230;
  const padding = 32;

  const values = data.map((item) => item.revenue);
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);

  const points = data.map((item, index) => {
    const x =
      padding +
      (index / Math.max(data.length - 1, 1)) * (width - padding * 2);

    const y =
      height -
      padding -
      ((item.revenue - min) / Math.max(max - min, 1)) *
        (height - padding * 2);

    return { x, y, ...item };
  });

  const line = points
    .map((point, index) =>
      `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`
    )
    .join(" ");

  const area = `${line} L ${points[points.length - 1]?.x || width - padding} ${
    height - padding
  } L ${padding} ${height - padding} Z`;

  return (
    <div className="marketing-line-chart">
      {data.length === 0 ? (
        <div className="marketing-chart-empty">
          <FiBarChart2 />
          <p>No campaign-attributed revenue data yet.</p>
          <span>Link orders to campaigns using campaignId.</span>
        </div>
      ) : (
        <>
          <div className="marketing-chart-labels">
            <span>{money(max)}</span>
            <span>{money(max / 2)}</span>
            <span>{money(0)}</span>
          </div>

          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="marketing-line-svg"
            role="img"
            aria-label="Monthly campaign revenue chart"
          >
            {[0, 1, 2, 3].map((lineIndex) => {
              const y =
                padding +
                (lineIndex / 3) * (height - padding * 2);

              return (
                <line
                  key={lineIndex}
                  x1={padding}
                  x2={width - padding}
                  y1={y}
                  y2={y}
                  className="marketing-grid-line"
                />
              );
            })}

            <defs>
              <linearGradient
                id="marketingAreaGradient"
                x1="0"
                x2="0"
                y1="0"
                y2="1"
              >
                <stop offset="0%" stopColor="#873b4c" stopOpacity=".25" />
                <stop offset="100%" stopColor="#873b4c" stopOpacity="0" />
              </linearGradient>
            </defs>

            <path d={area} fill="url(#marketingAreaGradient)" />
            <path d={line} className="marketing-line-path" />

            {points.map((point, index) => (
              <circle
                key={index}
                cx={point.x}
                cy={point.y}
                r="4"
                className="marketing-line-dot"
              >
                <title>
                  {point.label}: {money(point.revenue)}
                </title>
              </circle>
            ))}
          </svg>

          <div className="marketing-chart-months">
            {points.map((point, index) => (
              <span key={index}>{point.label}</span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ChannelChart({ campaigns }) {
  const channelData = useMemo(() => {
    const totals = CHANNELS.map((channel) => ({
      channel,
      value: campaigns
        .filter((campaign) => campaign.channel === channel)
        .reduce((sum, campaign) => sum + Number(campaign.reach || 0), 0),
    })).filter((item) => item.value > 0);

    const total = totals.reduce((sum, item) => sum + item.value, 0);

    return totals.map((item) => ({
      ...item,
      percentage: total ? (item.value / total) * 100 : 0,
    }));
  }, [campaigns]);

  const colors = ["#873b4c", "#b99a65", "#393939", "#a8a09a", "#d8c6c2", "#70645e"];

  return (
    <div className="marketing-channel-content">
      {channelData.length === 0 ? (
        <div className="marketing-chart-empty">
          <FiUsers />
          <p>No channel data available.</p>
        </div>
      ) : (
        <>
          <div className="marketing-channel-bars">
            {channelData.map((item, index) => (
              <div className="marketing-channel-row" key={item.channel}>
                <div className="marketing-channel-info">
                  <span className="marketing-channel-dot" style={{ background: colors[index % colors.length] }} />
                  <span>{item.channel}</span>
                  <strong>{item.percentage.toFixed(1)}%</strong>
                </div>
                <div className="marketing-channel-track">
                  <span
                    style={{
                      width: `${item.percentage}%`,
                      background: colors[index % colors.length],
                    }}
                  />
                </div>
                <small>{number(item.value)} reach</small>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function FunnelChart({ reach, clicks, conversions }) {
  const steps = [
    { label: "Audience Reach", value: reach, icon: <FiEye /> },
    { label: "Link Clicks", value: clicks, icon: <FiMousePointer /> },
    { label: "Conversions", value: conversions, icon: <FiCheckCircle /> },
  ];

  const max = Math.max(reach, 1);

  return (
    <div className="marketing-funnel">
      {steps.map((step, index) => (
        <div className="marketing-funnel-step" key={step.label}>
          <div className="marketing-funnel-heading">
            <span>{step.icon} {step.label}</span>
            <strong>{number(step.value)}</strong>
          </div>
          <div className="marketing-funnel-track">
            <span
              style={{
                width: `${Math.min((step.value / max) * 100, 100)}%`,
              }}
              className={`funnel-fill funnel-fill-${index + 1}`}
            />
          </div>
        </div>
      ))}
      <div className="marketing-funnel-rate">
        <span>Reach to conversion rate</span>
        <strong>
          {reach ? ((conversions / reach) * 100).toFixed(2) : "0.00"}%
        </strong>
      </div>
    </div>
  );
}

export default function AdminMarketing() {
  const [campaigns, setCampaigns] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("6");

  useEffect(() => {
    const campaignsRef = ref(db, "marketingCampaigns");
    const ordersRef = ref(db, "orders");

    const unsubscribeCampaigns = onValue(
      campaignsRef,
      (snapshot) => {
        const value = snapshot.val() || {};
        setCampaigns(
          Object.entries(value).map(([id, campaign]) => ({
            id,
            ...campaign,
          }))
        );
        setLoading(false);
        setError("");
      },
      (err) => {
        console.error("Marketing campaigns:", err);
        setError("Unable to load campaigns. Check your Firebase permissions.");
        setLoading(false);
      }
    );

    const unsubscribeOrders = onValue(
      ordersRef,
      (snapshot) => {
        const value = snapshot.val() || {};
        setOrders(
          Object.entries(value).map(([id, order]) => ({
            id,
            ...order,
          }))
        );
      },
      (err) => console.error("Marketing orders:", err)
    );

    return () => {
      unsubscribeCampaigns();
      unsubscribeOrders();
    };
  }, []);

  const metrics = useMemo(() => {
    const activeCampaigns = campaigns.filter(
      (campaign) => campaign.status === "active"
    );

    const reach = campaigns.reduce(
      (sum, campaign) => sum + Number(campaign.reach || 0),
      0
    );

    const clicks = campaigns.reduce(
      (sum, campaign) => sum + Number(campaign.clicks || 0),
      0
    );

    const conversions = campaigns.reduce(
      (sum, campaign) => sum + Number(campaign.conversions || 0),
      0
    );

    const attributedOrders = campaigns.flatMap((campaign) =>
      getCampaignOrders(orders, campaign.id)
    );

    const revenue = attributedOrders.reduce(
      (sum, order) => sum + getOrderAmount(order),
      0
    );

    const budget = campaigns.reduce(
      (sum, campaign) => sum + Number(campaign.budget || 0),
      0
    );

    const ctr = reach ? (clicks / reach) * 100 : 0;
    const conversionRate = clicks ? (conversions / clicks) * 100 : 0;
    const roi = budget ? ((revenue - budget) / budget) * 100 : 0;

    return {
      activeCampaigns: activeCampaigns.length,
      totalCampaigns: campaigns.length,
      reach,
      clicks,
      conversions,
      revenue,
      budget,
      ctr,
      conversionRate,
      roi,
    };
  }, [campaigns, orders]);

  const revenueData = useMemo(() => {
    const months = Number(selectedPeriod);
    const result = [];

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(1);
      date.setHours(0, 0, 0, 0);
      date.setMonth(date.getMonth() - i);

      const month = date.getMonth();
      const year = date.getFullYear();

      const revenue = orders
        .filter((order) => {
          const orderDate = getOrderDate(order);
          const campaignId = order.campaignId || order.marketingCampaignId;

          return (
            orderDate &&
            orderDate.getMonth() === month &&
            orderDate.getFullYear() === year &&
            campaignId &&
            campaigns.some((campaign) => campaign.id === String(campaignId)) &&
            isRevenueOrder(order)
          );
        })
        .reduce((sum, order) => sum + getOrderAmount(order), 0);

      result.push({
        label: date.toLocaleDateString("en", { month: "short" }),
        revenue,
      });
    }

    return result;
  }, [orders, campaigns, selectedPeriod]);

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((campaign) => {
      const matchesSearch =
        campaign.name?.toLowerCase().includes(search.toLowerCase()) ||
        campaign.channel?.toLowerCase().includes(search.toLowerCase());

      const matchesFilter =
        filter === "all" || campaign.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [campaigns, search, filter]);

  const openCreateModal = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEditModal = (campaign) => {
    setEditingId(campaign.id);
    setForm({
      name: campaign.name || "",
      channel: campaign.channel || "Instagram",
      status: campaign.status || "active",
      budget: campaign.budget ?? "",
      reach: campaign.reach ?? "",
      clicks: campaign.clicks ?? "",
      conversions: campaign.conversions ?? "",
      startDate: campaign.startDate || "",
      endDate: campaign.endDate || "",
    });
    setShowModal(true);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSave = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      alert("Please enter a campaign name.");
      return;
    }

    const numericFields = ["budget", "reach", "clicks", "conversions"];

    for (const field of numericFields) {
      if (Number(form[field] || 0) < 0) {
        alert(`${field} cannot be negative.`);
        return;
      }
    }

    if (Number(form.conversions || 0) > Number(form.clicks || 0)) {
      alert("Conversions cannot be greater than clicks.");
      return;
    }

    if (Number(form.clicks || 0) > Number(form.reach || 0)) {
      alert("Clicks cannot be greater than reach.");
      return;
    }

    if (
      form.startDate &&
      form.endDate &&
      new Date(form.endDate) < new Date(form.startDate)
    ) {
      alert("End date cannot be earlier than start date.");
      return;
    }

    setSaving(true);

    const campaignData = {
      name: form.name.trim(),
      channel: form.channel,
      status: form.status,
      budget: Number(form.budget || 0),
      reach: Number(form.reach || 0),
      clicks: Number(form.clicks || 0),
      conversions: Number(form.conversions || 0),
      startDate: form.startDate,
      endDate: form.endDate,
      updatedAt: Date.now(),
    };

    try {
      if (editingId) {
        await update(ref(db, `marketingCampaigns/${editingId}`), campaignData);
      } else {
        const newCampaignRef = push(ref(db, "marketingCampaigns"));
        await set(newCampaignRef, {
          ...campaignData,
          createdAt: Date.now(),
        });
      }

      setShowModal(false);
      setForm(EMPTY_FORM);
      setEditingId(null);
    } catch (err) {
      console.error(err);
      alert("Could not save campaign. Please check Firebase permissions.");
    } finally {
      setSaving(false);
    }
  };

  const toggleCampaign = async (campaign) => {
    const nextStatus = campaign.status === "active" ? "paused" : "active";

    try {
      await update(ref(db, `marketingCampaigns/${campaign.id}`), {
        status: nextStatus,
        updatedAt: Date.now(),
      });
    } catch (err) {
      console.error(err);
      alert("Unable to update campaign status.");
    }
  };

  const deleteCampaign = async (campaign) => {
    const confirmed = window.confirm(
      `Delete "${campaign.name}"? This cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await remove(ref(db, `marketingCampaigns/${campaign.id}`));
    } catch (err) {
      console.error(err);
      alert("Unable to delete campaign.");
    }
  };

  if (loading) {
    return (
      <div className="marketing-page">
        <div className="marketing-loading">
          <span className="marketing-loader" />
          <p>Preparing your marketing studio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="marketing-page">
      <div className="marketing-header">
        <div>
          <div className="marketing-eyebrow">
            <FiActivity /> AURA INTELLIGENCE
          </div>
          <h1>Marketing Studio</h1>
          <p>
            Track campaigns, understand customer engagement and measure
            marketing performance.
          </p>
        </div>

        <button className="marketing-primary-btn" onClick={openCreateModal}>
          <FiPlus /> Create Campaign
        </button>
      </div>

      {error && <div className="marketing-error">{error}</div>}

      <section className="marketing-hero">
        <div className="marketing-hero-copy">
          <span>YOUR MARKETING AT A GLANCE</span>
          <h2>Turn attention into measurable growth.</h2>
          <p>
            Monitor your campaign activity and discover which channels are
            bringing customers to AURA.
          </p>
        </div>

        <div className="marketing-hero-icon">
          <FiVolume2 /> {/* Replaced FiMegaphone */}
          <span className="marketing-orbit orbit-one" />
          <span className="marketing-orbit orbit-two" />
        </div>

        <div className="marketing-hero-stats">
          <div>
            <span>Active campaigns</span>
            <strong>{number(metrics.activeCampaigns)}</strong>
          </div>
          <div>
            <span>Total reach</span>
            <strong>{number(metrics.reach)}</strong>
          </div>
        </div>
      </section>

      <section className="marketing-kpi-grid">
        <article className="marketing-kpi-card">
          <div className="marketing-kpi-top">
            <span>Campaign Revenue</span>
            <span className="marketing-kpi-icon burgundy"><FiTrendingUp /></span>
          </div>
          <h3>{money(metrics.revenue)}</h3>
          <p>Revenue from campaign-linked orders</p>
        </article>

        <article className="marketing-kpi-card">
          <div className="marketing-kpi-top">
            <span>Total Reach</span>
            <span className="marketing-kpi-icon champagne"><FiUsers /></span>
          </div>
          <h3>{number(metrics.reach)}</h3>
          <p>Recorded audience reach</p>
        </article>

        <article className="marketing-kpi-card">
          <div className="marketing-kpi-top">
            <span>Conversions</span>
            <span className="marketing-kpi-icon charcoal"><FiTarget /></span>
          </div>
          <h3>{number(metrics.conversions)}</h3>
          <p>Recorded campaign conversions</p>
        </article>

        <article className="marketing-kpi-card">
          <div className="marketing-kpi-top">
            <span>Click Through Rate</span>
            <span className="marketing-kpi-icon soft"><FiMousePointer /></span>
          </div>
          <h3>{metrics.ctr.toFixed(2)}%</h3>
          <p>Clicks divided by total reach</p>
        </article>

        <article className="marketing-kpi-card">
          <div className="marketing-kpi-top">
            <span>Marketing ROI</span>
            <span className="marketing-kpi-icon burgundy"><FiBarChart2 /></span>
          </div>
          <h3>{metrics.roi.toFixed(1)}%</h3>
          <p>Based on campaign budget and attributed revenue</p>
        </article>
      </section>

      <section className="marketing-main-grid">
        <article className="marketing-panel marketing-revenue-panel">
          <div className="marketing-panel-heading">
            <div>
              <span className="marketing-section-label">PERFORMANCE</span>
              <h2>Campaign Revenue</h2>
              <p>Revenue from orders linked to your campaigns</p>
            </div>

            <select
              value={selectedPeriod}
              onChange={(event) => setSelectedPeriod(event.target.value)}
              className="marketing-period-select"
            >
              <option value="3">Last 3 months</option>
              <option value="6">Last 6 months</option>
              <option value="12">Last 12 months</option>
            </select>
          </div>

          <div className="marketing-chart-summary">
            <strong>{money(metrics.revenue)}</strong>
            <span><FiActivity /> Attributed revenue</span>
          </div>

          <LineChart data={revenueData} />
        </article>

        <article className="marketing-panel">
          <div className="marketing-panel-heading">
            <div>
              <span className="marketing-section-label">CHANNEL MIX</span>
              <h2>Traffic Sources</h2>
              <p>Audience reach by marketing channel</p>
            </div>
            <span className="marketing-heading-icon"><FiUsers /></span>
          </div>

          <ChannelChart campaigns={campaigns} />
        </article>
      </section>

      <section className="marketing-secondary-grid">
        <article className="marketing-panel">
          <div className="marketing-panel-heading">
            <div>
              <span className="marketing-section-label">CUSTOMER JOURNEY</span>
              <h2>Conversion Funnel</h2>
              <p>From campaign reach to recorded conversions</p>
            </div>
          </div>

          <FunnelChart
            reach={metrics.reach}
            clicks={metrics.clicks}
            conversions={metrics.conversions}
          />
        </article>

        <article className="marketing-panel marketing-insight-panel">
          <span className="marketing-section-label">CAMPAIGN INSIGHTS</span>
          <h2>Your marketing snapshot</h2>

          <div className="marketing-insight-row">
            <div className="marketing-insight-icon"><FiVolume2 /></div> {/* Replaced FiMegaphone */}
            <div>
              <strong>{metrics.totalCampaigns} campaigns created</strong>
              <p>Across all recorded marketing channels</p>
            </div>
          </div>

          <div className="marketing-insight-row">
            <div className="marketing-insight-icon"><FiMousePointer /></div>
            <div>
              <strong>{metrics.conversionRate.toFixed(2)}% click conversion</strong>
              <p>Recorded conversions divided by clicks</p>
            </div>
          </div>

          <div className="marketing-insight-row">
            <div className="marketing-insight-icon"><FiCalendar /></div>
            <div>
              <strong>{money(metrics.budget)} campaign budget</strong>
              <p>Total budget recorded across campaigns</p>
            </div>
          </div>
        </article>
      </section>

      <section className="marketing-panel marketing-campaign-panel">
        <div className="marketing-panel-heading marketing-campaign-heading">
          <div>
            <span className="marketing-section-label">CAMPAIGN MANAGEMENT</span>
            <h2>All Campaigns</h2>
            <p>Manage your marketing activities in one place.</p>
          </div>
          <span className="marketing-campaign-count">
            {campaigns.length} Total
          </span>
        </div>

        <div className="marketing-toolbar">
          <div className="marketing-search">
            <FiSearch />
            <input
              type="text"
              placeholder="Search campaigns or channels..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="marketing-filter">
            <FiFilter />
            <select value={filter} onChange={(event) => setFilter(event.target.value)}>
              <option value="all">All campaigns</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
            </select>
          </div>
        </div>

        <div className="marketing-table-wrap">
          <table className="marketing-table">
            <thead>
              <tr>
                <th>CAMPAIGN</th>
                <th>CHANNEL</th>
                <th>REACH</th>
                <th>CLICKS</th>
                <th>CONVERSIONS</th>
                <th>BUDGET</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredCampaigns.map((campaign) => (
                <tr key={campaign.id}>
                  <td>
                    <div className="marketing-campaign-name">
                      <span className="marketing-campaign-avatar">
                        <FiVolume2 /> {/* Replaced FiMegaphone */}
                      </span>
                      <div>
                        <strong>{campaign.name}</strong>
                        <small>
                          {campaign.startDate || "No start date"}
                        </small>
                      </div>
                    </div>
                  </td>
                  <td>{campaign.channel}</td>
                  <td>{number(campaign.reach)}</td>
                  <td>{number(campaign.clicks)}</td>
                  <td>{number(campaign.conversions)}</td>
                  <td>{money(campaign.budget)}</td>
                  <td>
                    <span className={`marketing-status ${campaign.status}`}>
                      {campaign.status || "unknown"}
                    </span>
                  </td>
                  <td>
                    <div className="marketing-actions">
                      <button
                        title="Edit campaign"
                        onClick={() => openEditModal(campaign)}
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        title={campaign.status === "active" ? "Pause" : "Activate"}
                        onClick={() => toggleCampaign(campaign)}
                      >
                        {campaign.status === "active" ? <FiPause /> : <FiPlay />}
                      </button>
                      <button
                        title="Delete campaign"
                        className="delete-action"
                        onClick={() => deleteCampaign(campaign)}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredCampaigns.length === 0 && (
                <tr>
                  <td colSpan="8">
                    <div className="marketing-table-empty">
                      <FiVolume2 /> {/* Replaced FiMegaphone */}
                      <strong>No campaigns found</strong>
                      <span>Create a campaign to start tracking performance.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {showModal && (
        <div
          className="marketing-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowModal(false);
          }}
        >
          <form className="marketing-modal" onSubmit={handleSave}>
            <div className="marketing-modal-heading">
              <div>
                <span className="marketing-section-label">CAMPAIGN SETUP</span>
                <h2>{editingId ? "Edit Campaign" : "Create Campaign"}</h2>
                <p>Enter your campaign details and performance metrics.</p>
              </div>
              <button
                type="button"
                className="marketing-modal-close"
                onClick={() => setShowModal(false)}
              >
                <FiX />
              </button>
            </div>

            <div className="marketing-form-grid">
              <label className="marketing-form-full">
                Campaign Name
                <input
                  name="name"
                  value={form.name}
                  onChange={handleFormChange}
                  placeholder="e.g. Winter Collection Launch"
                  required
                />
              </label>

              <label>
                Marketing Channel
                <select name="channel" value={form.channel} onChange={handleFormChange}>
                  {CHANNELS.map((channel) => (
                    <option key={channel} value={channel}>{channel}</option>
                  ))}
                </select>
              </label>

              <label>
                Campaign Status
                <select name="status" value={form.status} onChange={handleFormChange}>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                </select>
              </label>

              <label>
                Budget (PKR)
                <input
                  type="number"
                  min="0"
                  name="budget"
                  value={form.budget}
                  onChange={handleFormChange}
                  placeholder="50000"
                />
              </label>

              <label>
                Audience Reach
                <input
                  type="number"
                  min="0"
                  name="reach"
                  value={form.reach}
                  onChange={handleFormChange}
                  placeholder="10000"
                />
              </label>

              <label>
                Link Clicks
                <input
                  type="number"
                  min="0"
                  name="clicks"
                  value={form.clicks}
                  onChange={handleFormChange}
                  placeholder="2500"
                />
              </label>

              <label>
                Conversions
                <input
                  type="number"
                  min="0"
                  name="conversions"
                  value={form.conversions}
                  onChange={handleFormChange}
                  placeholder="150"
                />
              </label>

              <label>
                Start Date
                <input
                  type="date"
                  name="startDate"
                  value={form.startDate}
                  onChange={handleFormChange}
                />
              </label>

              <label>
                End Date
                <input
                  type="date"
                  name="endDate"
                  value={form.endDate}
                  onChange={handleFormChange}
                />
              </label>
            </div>

            <div className="marketing-modal-actions">
              <button
                type="button"
                className="marketing-cancel-btn"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="marketing-primary-btn"
                disabled={saving}
              >
                {saving ? "Saving..." : editingId ? "Save Changes" : "Create Campaign"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}