import { useCallback, useEffect, useState } from "react";
import {
  Bell,
  Search,
  Globe,
  ChevronDown,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  ExternalLink,
  WifiOff,
  Radio,
  Users,
  ShieldAlert,
  CreditCard,
  Wallet,
  ClipboardList,
  Flame,
  Route,
  Activity,
  ArrowRight,
  FileText,
  DollarSign,
  AlertOctagon,
  Eye,
  X,
  Check,
} from "lucide-react";

import Sidebar from "./Sidebar";
import StatCard from "./StatCard";
import MissionDrawer from "./MissionDrawer";
import "./CommandDashboard.css";

import {
  getDashboardStats,
  getDashboardOverview,
  getLiveAgents,
  updateAgentStatus,
} from "../services/api";

const statusLabels = {
  ON_DUTY: "On Duty",
  ON_MISSION: "On Mission",
  INSPECTING: "Inspecting",
  BREAK: "On Break",
  OFFLINE: "Offline",
  AVAILABLE: "Available",
  EMERGENCY: "Emergency",
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [agents, setAgents] = useState([]);
  const [backendOverview, setBackendOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [selectedMission, setSelectedMission] = useState(null);
  const [activeAgentDetail, setActiveAgentDetail] = useState(null);
  const [currentTime, setCurrentTime] = useState("05 October 2026 · 10:42:16");

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const [selectedDate, setSelectedDate] = useState("05 October 2026");
  const [selectedScope, setSelectedScope] = useState("All Guinea");
  const [selectedRegion, setSelectedRegion] = useState("All Regions");
  const [selectedSupervisor, setSelectedSupervisor] = useState("All Supervisors");
  const [selectedStatus, setSelectedStatus] = useState("Agent Status");

  // Filter Dropdown Options
  const dateOptions = [
    "05 October 2026",
    "04 October 2026",
    "Last 7 Days",
    "Last 30 Days",
    "October 2026",
    "All Time",
  ];

  const scopeOptions = [
    "All Guinea",
    "National Corridors (RN1, RN3)",
    "Conakry Metro Zone",
    "Maritime Guinea",
    "Middle Guinea",
    "Upper Guinea",
    "Forest Guinea",
  ];

  const regionOptions = [
    "All Regions",
    "Conakry",
    "Kindia",
    "Boké",
    "Mamou",
    "Labé",
    "Kankan",
    "Faranah",
    "Nzérékoré",
  ];

  const supervisorOptions = [
    "All Supervisors",
    "Ibrahima Camara (National)",
    "Fodé Soumah (Maritime)",
    "Fatoumata Barry (Kindia)",
    "Kadiatou Touré (Conakry Urban)",
    "Amadou Diallo (Northern)",
  ];

  const statusOptions = [
    { label: "Agent Status", value: "ALL", count: 42 },
    { label: "On Mission", value: "ON_MISSION", count: 18 },
    { label: "Inspecting", value: "INSPECTING", count: 9 },
    { label: "Available", value: "AVAILABLE", count: 12 },
    { label: "On Break", value: "BREAK", count: 3 },
    { label: "Offline", value: "OFFLINE", count: 6 },
    { label: "Emergency", value: "EMERGENCY", count: 1 },
  ];

  // Outside click & keyboard shortcuts (Cmd+K / Esc)
  useEffect(() => {
    const handleGlobalClick = (e) => {
      if (!e.target.closest(".cmd-filter-dropdown-wrap")) {
        setActiveDropdown(null);
      }
      if (!e.target.closest(".cmd-search-wrap")) {
        setIsSearchOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        const searchInput = document.getElementById("cmd-global-search");
        if (searchInput) {
          searchInput.focus();
          setIsSearchOpen(true);
        }
      }
      if (e.key === "Escape") {
        setActiveDropdown(null);
        setIsSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleGlobalClick);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleGlobalClick);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Keep a live realistic clock for the topbar
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString("en-GB", { hour12: false });
      setCurrentTime(`05 October 2026 · ${timeStr}`);
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch stats and agents
  const loadDashboard = useCallback(async () => {
    try {
      const [statsData, overviewData] = await Promise.all([
        getDashboardStats().catch(() => null),
        getDashboardOverview({
          search: searchQuery,
          region: selectedRegion,
          supervisor: selectedSupervisor,
          status: selectedStatus,
          scope: selectedScope,
        }).catch(() => null),
      ]);

      if (statsData) setStats(statsData);
      if (overviewData) {
        setBackendOverview(overviewData);
        if (overviewData.agents && overviewData.agents.length > 0) {
          setAgents(overviewData.agents);
        }
      }
    } catch (err) {
      console.warn("Using dashboard seeded defaults for Command Center", err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedRegion, selectedSupervisor, selectedStatus, selectedScope]);

  const handleUpdateStatus = async (agentId, nextStatus) => {
    try {
      await updateAgentStatus(agentId, nextStatus);
      await loadDashboard();
    } catch (err) {
      console.error("Failed to update agent status:", err);
    }
  };

  useEffect(() => {
    loadDashboard();
    const timer = setInterval(() => loadDashboard(), 30000);
    return () => clearInterval(timer);
  }, [loadDashboard]);

  // Seeded / combined agent list matching the uploaded design
  const defaultAgents = [
    {
      id: 1,
      name: "Mamadou Diallo",
      badgeNumber: "AGT-1048",
      role: "Field Inspector",
      status: "ON_MISSION",
      statusLabel: "On Mission",
      statusClass: "pill-active",
      initials: "MD",
      avatarBg: "#2563eb",
      missionCode: "GR-MSN-2026-00984",
      shortMission: "…00984",
      road: "RN1",
      route: "Coyah Junction → Dubréka",
      location: "RN1 Coyah",
      region: "Kindia",
      supervisor: "Ibrahima Camara (National)",
      scope: "National Corridors (RN1, RN3)",
      duty: "02h 14m",
      dutyStart: "08:02",
      sync: "1 min",
      syncAgo: "1 min ago",
      syncClass: "sync-online",
      progress: 40,
      cashToday: "GNF 350,000",
      gps: "Active",
      connection: "Online",
      lat: 9.705,
      lng: -13.385,
      missions: [
        {
          id: 1,
          missionCode: "GR-MSN-2026-00984",
          roadName: "RN1",
          totalKm: 18.6,
          coveredKm: 7.4,
          status: "ACTIVE",
          startedAt: new Date(Date.now() - 3120000).toISOString(),
          violations: [
            {
              id: 1,
              violationCode: "GR-VIO-001",
              violationType: "Unauthorized Heavy Vehicle",
              fineAmountGnf: 750000,
              paid: true,
            },
            {
              id: 2,
              violationCode: "GR-VIO-002",
              violationType: "Expired Registration",
              fineAmountGnf: 300000,
              paid: false,
            },
          ],
        },
      ],
    },
    {
      id: 2,
      name: "Aissatou Bah",
      badgeNumber: "AGT-1052",
      role: "Field Inspector",
      status: "INSPECTING",
      statusLabel: "Inspecting",
      statusClass: "pill-inspecting",
      initials: "AB",
      avatarBg: "#0284c7",
      missionCode: "GR-MSN-2026-00991",
      shortMission: "…00991",
      road: "R. Le Prince",
      route: "Hamdallaye → Sonfonia",
      location: "R. Le Prince",
      region: "Conakry",
      supervisor: "Kadiatou Touré (Conakry Urban)",
      scope: "Conakry Metro Zone",
      duty: "01h 32m",
      dutyStart: "08:44",
      sync: "30 sec",
      syncAgo: "30 sec ago",
      syncClass: "sync-online",
      progress: 68,
      cashToday: "GNF 180,000",
      gps: "Active",
      connection: "Online",
      lat: 9.612,
      lng: -13.62,
      missions: [
        {
          id: 2,
          missionCode: "GR-MSN-2026-00991",
          roadName: "R. Le Prince",
          totalKm: 15.0,
          coveredKm: 10.2,
          status: "ACTIVE",
          startedAt: new Date(Date.now() - 5520000).toISOString(),
          violations: [],
        },
      ],
    },
    {
      id: 3,
      name: "Alpha Condé",
      badgeNumber: "AGT-1061",
      role: "Field Inspector",
      status: "OFFLINE",
      statusLabel: "Offline",
      statusClass: "pill-offline",
      initials: "AC",
      avatarBg: "#475569",
      missionCode: "GR-MSN-2026-00987",
      shortMission: "…00987",
      road: "RN1",
      route: "Dubréka → Tanéné",
      location: "Dubréka",
      region: "Kindia",
      supervisor: "Fodé Soumah (Maritime)",
      scope: "National Corridors (RN1, RN3)",
      duty: "03h 05m",
      dutyStart: "07:11",
      sync: "18 min",
      syncAgo: "18 min ago",
      syncClass: "sync-offline",
      progress: 55,
      cashToday: "GNF 420,000",
      gps: "Inactive",
      connection: "Offline",
      lat: 9.79,
      lng: -13.52,
      missions: [
        {
          id: 3,
          missionCode: "GR-MSN-2026-00987",
          roadName: "RN1",
          totalKm: 22.0,
          coveredKm: 12.1,
          status: "ACTIVE",
          startedAt: new Date(Date.now() - 11100000).toISOString(),
          violations: [],
        },
      ],
    },
    {
      id: 4,
      name: "Mariama Camara",
      badgeNumber: "AGT-1067",
      role: "Patrol Officer",
      status: "AVAILABLE",
      statusLabel: "Available",
      statusClass: "pill-available",
      initials: "MC",
      avatarBg: "#16a34a",
      missionCode: "—",
      shortMission: "—",
      road: "Conakry",
      route: "Zone Portuaire",
      location: "Conakry",
      region: "Conakry",
      supervisor: "Kadiatou Touré (Conakry Urban)",
      scope: "Conakry Metro Zone",
      duty: "01h 45m",
      dutyStart: "08:31",
      sync: "1 min",
      syncAgo: "1 min ago",
      syncClass: "sync-online",
      progress: 0,
      cashToday: "GNF 0",
      gps: "Active",
      connection: "Online",
      lat: 9.537,
      lng: -13.678,
      missions: [],
    },
  ];

  // Active missions list
  const defaultMissions = [
    {
      id: "00984",
      code: "GR-MSN-2026-00984",
      agentName: "Mamadou Diallo",
      road: "RN1",
      route: "Coyah → Dubréka",
      region: "Kindia",
      supervisor: "Ibrahima Camara (National)",
      progress: 40,
      duration: "00h 52m",
      status: "In Progress",
      agentId: 1,
    },
    {
      id: "00991",
      code: "GR-MSN-2026-00991",
      agentName: "Aissatou Bah",
      road: "R. Le Prince",
      route: "Hamdallaye → Sonfonia",
      region: "Conakry",
      supervisor: "Kadiatou Touré (Conakry Urban)",
      progress: 68,
      duration: "01h 32m",
      status: "In Progress",
      agentId: 2,
    },
    {
      id: "00988",
      code: "GR-MSN-2026-00988",
      agentName: "Oumar Kouyaté",
      road: "RN3",
      route: "Kindia → Mamou",
      region: "Kindia",
      supervisor: "Fatoumata Barry (Kindia)",
      progress: 55,
      duration: "02h 30m",
      status: "In Progress",
      agentId: 3,
    },
    {
      id: "00990",
      code: "GR-MSN-2026-00990",
      agentName: "Sékou Touré",
      road: "R. Industrielle",
      route: "Zone Ind. → Port",
      region: "Conakry",
      supervisor: "Kadiatou Touré (Conakry Urban)",
      progress: 80,
      duration: "01h 14m",
      status: "In Progress",
      agentId: 4,
    },
  ];

  // Damage Reports dataset
  const defaultDamages = [
    {
      id: "26-04-128",
      road: "RN1",
      agent: "M. Diallo",
      category: "Road Surface",
      severity: "Severe",
      sevClass: "sev-severe",
      time: "10:38",
      status: "Reported",
      statusClass: "status-reported",
      region: "Kindia",
    },
    {
      id: "26-04-127",
      road: "R. Le Prince",
      agent: "A. Bah",
      category: "Drainage",
      severity: "Moderate",
      sevClass: "sev-moderate",
      time: "10:24",
      status: "Validated",
      statusClass: "status-validated",
      region: "Conakry",
    },
    {
      id: "26-04-125",
      road: "RN3",
      agent: "A. Sylla",
      category: "Bridge / Structure",
      severity: "Critical",
      sevClass: "sev-critical",
      time: "09:57",
      status: "Awaiting Validation",
      statusClass: "status-awaiting",
      region: "Kindia",
    },
    {
      id: "26-04-121",
      road: "R. Industrielle",
      agent: "S. Touré",
      category: "Pavement Erosion",
      severity: "Moderate",
      sevClass: "sev-moderate",
      time: "09:15",
      status: "Validated",
      statusClass: "status-validated",
      region: "Conakry",
    },
  ];

  // Violations dataset
  const defaultViolations = [
    {
      id: "26-01844",
      agent: "M. Diallo",
      vehicle: "RC-8245-AB",
      road: "RN1",
      type: "Unauthorized Heavy Vehicle",
      severity: "Severe",
      sevClass: "sev-severe",
      fine: "GNF 750,000",
      payment: "Paid Cash",
      paymentClass: "status-available",
      region: "Kindia",
    },
    {
      id: "26-01843",
      agent: "A. Bah",
      vehicle: "TransGuinée SA",
      road: "R. Le Prince",
      type: "Road Occupation",
      severity: "Moderate",
      sevClass: "sev-moderate",
      fine: "GNF 300,000",
      payment: "Issued",
      paymentClass: "status-awaiting",
      region: "Conakry",
    },
    {
      id: "26-01841",
      agent: "O. Kouyaté",
      vehicle: "RC-1920-CC",
      road: "RN3",
      type: "Overloaded Vehicle",
      severity: "Very Severe",
      sevClass: "sev-critical",
      fine: "GNF 1,200,000",
      payment: "Partially Paid",
      paymentClass: "status-on-mission",
      region: "Kindia",
    },
    {
      id: "26-01839",
      agent: "S. Touré",
      vehicle: "RC-4102-DD",
      road: "R. Industrielle",
      type: "Unsecured Cargo",
      severity: "Moderate",
      sevClass: "sev-moderate",
      fine: "GNF 450,000",
      payment: "Issued",
      paymentClass: "status-awaiting",
      region: "Conakry",
    },
  ];

  // Mobile Sync Health dataset
  const defaultSyncHealth = [
    {
      agent: "Alpha Condé",
      badge: "AGT-1061",
      mission: "…00987",
      lastSync: "18 min ago",
      pending: "3 records",
      status: "Offline",
      statusClass: "sync-offline",
      region: "Kindia",
    },
    {
      agent: "Mariama C.",
      badge: "AGT-1067",
      mission: "…00989",
      lastSync: "9 min ago",
      pending: "2 records",
      status: "Pending Sync",
      statusClass: "sync-pending",
      region: "Conakry",
    },
  ];

  // Recent Activities dataset
  const defaultActivities = [
    {
      id: "act-1",
      time: "10:42",
      type: "damage",
      iconClass: "act-damage",
      title: "Damage report submitted",
      desc: "Mamadou Diallo · DMG-2026-04128 · RN1",
      region: "Kindia",
    },
    {
      id: "act-2",
      time: "10:38",
      type: "mission",
      iconClass: "act-mission",
      title: "Mission completed",
      desc: "Aissatou Bah · GR-MSN-2026-00976",
      region: "Conakry",
    },
    {
      id: "act-3",
      time: "10:32",
      type: "violation",
      iconClass: "act-violation",
      title: "Violation recorded · Unauthorized heavy vehicle",
      desc: "RC-8245-AB · VIO-2026-01844 · RN1",
      region: "Kindia",
    },
    {
      id: "act-4",
      time: "10:21",
      type: "cash",
      iconClass: "act-cash",
      title: "Cash reconciled",
      desc: "Finance · GNF 850,000 · AGT-1041",
      region: "Kindia",
    },
    {
      id: "act-5",
      time: "10:14",
      type: "road",
      iconClass: "act-emergency",
      title: "Critical road blockage reported",
      desc: "Coyah · RN1 · km 7.4",
      region: "Kindia",
    },
    {
      id: "act-6",
      time: "09:58",
      type: "offline",
      iconClass: "act-offline",
      title: "Agent went offline during active mission",
      desc: "Alpha Condé · AGT-1061 · GR-MSN-2026-00987",
      region: "Kindia",
    },
  ];

  // Live dynamic lists connecting PostgreSQL Prisma to UI
  const displayAgents = (backendOverview?.agents && backendOverview.agents.length > 0)
    ? backendOverview.agents.map((ag) => {
      const activeMsn = ag.missions && ag.missions[0] ? ag.missions[0] : null;
      return {
        id: ag.id,
        name: ag.name,
        badgeNumber: ag.badgeNumber,
        role: ag.role || "Field Inspector",
        status: ag.status,
        statusLabel: statusLabels[ag.status] || ag.status,
        statusClass:
          ag.status === "ON_MISSION" ? "pill-active" :
            ag.status === "INSPECTING" ? "pill-inspecting" :
              ag.status === "AVAILABLE" ? "pill-available" :
                ag.status === "BREAK" ? "pill-break" :
                  ag.status === "EMERGENCY" ? "pill-emergency" : "pill-offline",
        initials: ag.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase(),
        avatarBg: ag.avatarBg || "#2563eb",
        missionCode: activeMsn ? activeMsn.missionCode : "—",
        shortMission: activeMsn ? activeMsn.missionCode.replace("GR-MSN-2026-", "…") : "—",
        road: activeMsn ? activeMsn.roadName : (ag.location || "RN1"),
        route: (activeMsn && activeMsn.route) ? activeMsn.route : (ag.location || "Guinée Corridor"),
        location: ag.location || (activeMsn ? activeMsn.roadName : "Conakry"),
        region: ag.region || "Kindia",
        supervisor: ag.supervisor || "Ibrahima Camara (National)",
        scope: ag.scope || "All Guinea",
        duty: "02h 14m",
        dutyStart: ag.dutyStart || "08:00",
        sync: ag.connectionStatus === "Offline" ? "18 min" : "1 min",
        syncAgo: ag.connectionStatus === "Offline" ? "18 min ago" : "1 min ago",
        syncClass: ag.connectionStatus === "Offline" ? "sync-offline" : "sync-online",
        progress: activeMsn && activeMsn.totalKm > 0 ? Math.round((activeMsn.coveredKm / activeMsn.totalKm) * 100) : 0,
        cashToday: `GNF ${(ag.cashTodayGnf || 0).toLocaleString()}`,
        gps: ag.gpsActive ? "Active" : "Inactive",
        connection: ag.connectionStatus || "Online",
        lat: ag.lat,
        lng: ag.lng,
        missions: ag.missions || [],
      };
    })
    : defaultAgents;

  const activeMissionsList = (backendOverview?.missions && backendOverview.missions.length > 0)
    ? backendOverview.missions
    : defaultMissions;

  const damageReportsList = (backendOverview?.damageReports && backendOverview.damageReports.length > 0)
    ? backendOverview.damageReports
    : defaultDamages;

  const violationsList = (backendOverview?.violations && backendOverview.violations.length > 0)
    ? backendOverview.violations
    : defaultViolations;

  const syncHealthList = (backendOverview?.syncHealth && backendOverview.syncHealth.length > 0)
    ? backendOverview.syncHealth
    : defaultSyncHealth;

  const recentActivitiesList = (backendOverview?.recentActivities && backendOverview.recentActivities.length > 0)
    ? backendOverview.recentActivities
    : defaultActivities;

  // Helper check for active filters
  const isFiltered =
    searchQuery.trim() !== "" ||
    selectedDate !== "05 October 2026" ||
    selectedScope !== "All Guinea" ||
    selectedRegion !== "All Regions" ||
    selectedSupervisor !== "All Supervisors" ||
    selectedStatus !== "Agent Status";

  const handleResetFilters = () => {
    setSearchQuery("");
    setIsSearchOpen(false);
    setSelectedDate("05 October 2026");
    setSelectedScope("All Guinea");
    setSelectedRegion("All Regions");
    setSelectedSupervisor("All Supervisors");
    setSelectedStatus("Agent Status");
    setActiveDropdown(null);
  };

  // 1. Filtered Agents
  const filteredAgents = displayAgents.filter((ag) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const match =
        ag.name.toLowerCase().includes(q) ||
        ag.badgeNumber.toLowerCase().includes(q) ||
        ag.road.toLowerCase().includes(q) ||
        ag.location.toLowerCase().includes(q) ||
        ag.missionCode.toLowerCase().includes(q) ||
        ag.role.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (selectedRegion !== "All Regions" && ag.region !== selectedRegion) {
      return false;
    }
    if (selectedSupervisor !== "All Supervisors") {
      const supKey = selectedSupervisor.split(" ")[0].toLowerCase();
      if (!ag.supervisor.toLowerCase().includes(supKey)) return false;
    }
    if (selectedStatus !== "Agent Status" && selectedStatus !== "ALL") {
      if (ag.statusLabel !== selectedStatus && ag.status !== selectedStatus) {
        return false;
      }
    }
    if (selectedScope !== "All Guinea") {
      if (selectedScope.includes("RN1") && !ag.road.includes("RN1") && !ag.road.includes("RN3")) {
        return false;
      }
      if (selectedScope.includes("Conakry") && ag.region !== "Conakry" && !ag.road.includes("Prince")) {
        return false;
      }
    }
    return true;
  });

  // 2. Filtered Missions
  const filteredMissions = activeMissionsList.filter((m) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const match =
        m.code.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q) ||
        m.agentName.toLowerCase().includes(q) ||
        m.road.toLowerCase().includes(q) ||
        m.route.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (selectedRegion !== "All Regions" && m.region !== selectedRegion) {
      return false;
    }
    if (selectedSupervisor !== "All Supervisors") {
      const supKey = selectedSupervisor.split(" ")[0].toLowerCase();
      if (!m.supervisor.toLowerCase().includes(supKey)) return false;
    }
    if (selectedScope !== "All Guinea") {
      if (selectedScope.includes("RN1") && !m.road.includes("RN1") && !m.road.includes("RN3")) {
        return false;
      }
      if (selectedScope.includes("Conakry") && m.region !== "Conakry" && !m.road.includes("Prince")) {
        return false;
      }
    }
    return true;
  });

  // 3. Filtered Damage Reports
  const filteredDamageReports = damageReportsList.filter((d) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const match =
        d.id.toLowerCase().includes(q) ||
        d.road.toLowerCase().includes(q) ||
        d.agent.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q) ||
        d.severity.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (selectedRegion !== "All Regions" && d.region !== selectedRegion) {
      return false;
    }
    if (selectedScope !== "All Guinea") {
      if (selectedScope.includes("RN1") && !d.road.includes("RN1") && !d.road.includes("RN3")) {
        return false;
      }
      if (selectedScope.includes("Conakry") && d.region !== "Conakry" && !d.road.includes("Prince")) {
        return false;
      }
    }
    return true;
  });

  // 4. Filtered Violations
  const filteredViolations = violationsList.filter((v) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const match =
        v.id.toLowerCase().includes(q) ||
        v.agent.toLowerCase().includes(q) ||
        v.vehicle.toLowerCase().includes(q) ||
        v.road.toLowerCase().includes(q) ||
        v.type.toLowerCase().includes(q) ||
        v.fine.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (selectedRegion !== "All Regions" && v.region !== selectedRegion) {
      return false;
    }
    if (selectedScope !== "All Guinea") {
      if (selectedScope.includes("RN1") && !v.road.includes("RN1") && !v.road.includes("RN3")) {
        return false;
      }
      if (selectedScope.includes("Conakry") && v.region !== "Conakry" && !v.road.includes("Prince")) {
        return false;
      }
    }
    return true;
  });

  // 5. Filtered Sync Health Agents
  const filteredSyncAgents = syncHealthList.filter((s) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const match =
        s.agent.toLowerCase().includes(q) ||
        s.badge.toLowerCase().includes(q) ||
        s.mission.toLowerCase().includes(q) ||
        s.status.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (selectedRegion !== "All Regions" && s.region !== selectedRegion) {
      return false;
    }
    return true;
  });

  // 6. Filtered Activity Feed
  const filteredActivities = recentActivitiesList.filter((a) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const match =
        a.title.toLowerCase().includes(q) ||
        a.desc.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (selectedRegion !== "All Regions" && a.region && a.region !== selectedRegion) {
      return false;
    }
    return true;
  });

  const searchResultsCount = searchQuery.trim()
    ? filteredAgents.length +
    filteredMissions.length +
    filteredViolations.length +
    filteredDamageReports.length
    : 0;

  // Currently focused agent in the Agent Detail card
  const activeInspector = activeAgentDetail || (filteredAgents.length > 0 ? filteredAgents[0] : displayAgents[0]);

  // Top 6 KPI Cards definition matching uploaded image and populated from live PostgreSQL
  const kpiCards = [
    {
      type: "agents",
      label: "Agents Online",
      value: isFiltered ? `${filteredAgents.length}` : (stats?.agentsOnDuty ?? "42"),
      description: isFiltered ? `${filteredAgents.length} matching filters` : `${stats?.totalAgents ?? 48} on duty today`,
      trend: "+3",
      trendType: "pos",
    },
    {
      type: "missions",
      label: "Active Missions",
      value: isFiltered ? `${filteredMissions.length}` : (stats?.activeMissions ?? "18"),
      description: isFiltered ? `${filteredMissions.length} active in scope` : "31 assigned today",
      trend: "+1",
      trendType: "pos",
    },
    {
      type: "reports",
      label: "Reports Today",
      value: isFiltered ? `${filteredDamageReports.length}` : (stats?.totalDamageReports ?? "27"),
      description: stats?.criticalHazardsCount ? `${stats.criticalHazardsCount} severe / critical` : "5 severe / critical",
      trend: "+6",
      trendType: "pos",
    },
    {
      type: "violations",
      label: "Violations Today",
      value: isFiltered ? `${filteredViolations.length}` : (stats?.totalViolations ?? "19"),
      description: "4 heavy vehicle",
      trend: "+2",
      trendType: "pos",
    },
    {
      type: "fines",
      label: "Fine Value Issued",
      value: isFiltered && filteredViolations.length < 4
        ? `GNF ${(filteredViolations.length * 0.7).toFixed(2)}M`
        : (stats?.totalFinesGnf ? `GNF ${(stats.totalFinesGnf / 1000000).toFixed(2)}M` : "GNF 12.85M"),
      description: "Today",
    },
    {
      type: "cash",
      label: "Cash Collected",
      value: isFiltered && filteredViolations.length < 4
        ? `GNF ${(filteredViolations.length * 0.35).toFixed(2)}M`
        : (stats?.paidFinesGnf ? `GNF ${(stats.paidFinesGnf / 1000000).toFixed(2)}M` : "GNF 5.40M"),
      description: stats?.unpaidFinesGnf ? `GNF ${(stats.unpaidFinesGnf / 1000000).toFixed(2)}M pending` : "GNF 1.25M pending",
    },
  ];

  return (
    <div className="app-shell cmd-dashboard" id="overview">
      <Sidebar />

      <main className="main-content">
        {/* Top Bar matching design */}
        <header className="cmd-topbar">
          <div className="cmd-topbar-title">Dashboard</div>

          <div className="cmd-search-wrap">
            <Search size={15} className="cmd-search-icon" />
            <input
              id="cmd-global-search"
              type="text"
              className="cmd-search-input"
              placeholder="Search agent, mission, road, vehicle, case…"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
            />
            {searchQuery && (
              <button
                type="button"
                className="cmd-search-clear"
                onClick={() => {
                  setSearchQuery("");
                  setIsSearchOpen(false);
                }}
                title="Clear search"
              >
                <X size={13} />
              </button>
            )}
            <span className="cmd-search-kbd">⌘K</span>

            {/* Live Search Quick Results Popover */}
            {isSearchOpen && searchQuery.trim().length > 0 && (
              <div className="cmd-search-popover">
                <div className="cmd-search-popover-header">
                  <span>
                    Results for "{searchQuery}" ({searchResultsCount} found)
                  </span>
                  <button
                    type="button"
                    className="cmd-drawer-close-btn"
                    onClick={() => setIsSearchOpen(false)}
                    style={{ padding: 2 }}
                  >
                    <X size={14} />
                  </button>
                </div>

                {searchResultsCount === 0 ? (
                  <div className="cmd-search-empty">
                    No agents, missions, or vehicles matching "{searchQuery}".
                  </div>
                ) : (
                  <>
                    {/* Matching Agents */}
                    {filteredAgents.length > 0 && (
                      <div className="cmd-search-group">
                        <div className="cmd-search-group-title">
                          Agents ({filteredAgents.length})
                        </div>
                        {filteredAgents.slice(0, 3).map((ag) => (
                          <button
                            key={ag.id}
                            type="button"
                            className="cmd-search-item"
                            onClick={() => {
                              setActiveAgentDetail(ag);
                              setIsSearchOpen(false);
                              const el = document.getElementById("live-map");
                              if (el) el.scrollIntoView({ behavior: "smooth" });
                            }}
                          >
                            <div className="cmd-search-item-left">
                              <div
                                className="cmd-search-item-icon"
                                style={{
                                  background: ag.avatarBg || "#2563eb",
                                  color: "#ffffff",
                                }}
                              >
                                {ag.initials}
                              </div>
                              <div className="cmd-search-item-meta">
                                <span className="cmd-search-item-title">
                                  {ag.name}
                                </span>
                                <span className="cmd-search-item-sub">
                                  {ag.badgeNumber} · {ag.road} · {ag.location}
                                </span>
                              </div>
                            </div>
                            <span
                              className={`cmd-search-item-badge ${ag.status === "ON_MISSION"
                                ? "status-on-mission"
                                : ag.status === "INSPECTING"
                                  ? "status-inspecting"
                                  : ag.status === "AVAILABLE"
                                    ? "status-available"
                                    : "status-offline"
                                }`}
                            >
                              {ag.statusLabel}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Matching Missions */}
                    {filteredMissions.length > 0 && (
                      <div className="cmd-search-group">
                        <div className="cmd-search-group-title">
                          Active Missions ({filteredMissions.length})
                        </div>
                        {filteredMissions.slice(0, 3).map((msn) => (
                          <button
                            key={msn.id}
                            type="button"
                            className="cmd-search-item"
                            onClick={() => {
                              setSelectedMission(msn);
                              setIsSearchOpen(false);
                            }}
                          >
                            <div className="cmd-search-item-left">
                              <div
                                className="cmd-search-item-icon"
                                style={{
                                  background: "#e9f2f9",
                                  color: "#1669aa",
                                }}
                              >
                                <Route size={14} />
                              </div>
                              <div className="cmd-search-item-meta">
                                <span className="cmd-search-item-title">
                                  {msn.code}
                                </span>
                                <span className="cmd-search-item-sub">
                                  {msn.agentName} · {msn.route}
                                </span>
                              </div>
                            </div>
                            <span
                              className="cmd-search-item-badge"
                              style={{
                                background: "#e9f6f2",
                                color: "#006946",
                              }}
                            >
                              {msn.progress}% · {msn.road}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Matching Violations */}
                    {filteredViolations.length > 0 && (
                      <div className="cmd-search-group">
                        <div className="cmd-search-group-title">
                          Violations & Vehicles ({filteredViolations.length})
                        </div>
                        {filteredViolations.slice(0, 3).map((v) => (
                          <button
                            key={v.id}
                            type="button"
                            className="cmd-search-item"
                            onClick={() => {
                              setIsSearchOpen(false);
                              const el = document.getElementById("enforcement");
                              if (el) el.scrollIntoView({ behavior: "smooth" });
                            }}
                          >
                            <div className="cmd-search-item-left">
                              <div
                                className="cmd-search-item-icon"
                                style={{
                                  background: "#fdebed",
                                  color: "#cd1126",
                                }}
                              >
                                <ShieldAlert size={14} />
                              </div>
                              <div className="cmd-search-item-meta">
                                <span className="cmd-search-item-title">
                                  {v.vehicle} · {v.type}
                                </span>
                                <span className="cmd-search-item-sub">
                                  VIO {v.id} · {v.road} · Agent {v.agent}
                                </span>
                              </div>
                            </div>
                            <strong
                              style={{
                                fontSize: "11px",
                                color: "#15231f",
                              }}
                            >
                              {v.fine}
                            </strong>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Matching Damage Reports */}
                    {filteredDamageReports.length > 0 && (
                      <div className="cmd-search-group">
                        <div className="cmd-search-group-title">
                          Damage Reports ({filteredDamageReports.length})
                        </div>
                        {filteredDamageReports.slice(0, 3).map((d) => (
                          <button
                            key={d.id}
                            type="button"
                            className="cmd-search-item"
                            onClick={() => {
                              setIsSearchOpen(false);
                              const el = document.getElementById("damage-reports");
                              if (el) el.scrollIntoView({ behavior: "smooth" });
                            }}
                          >
                            <div className="cmd-search-item-left">
                              <div
                                className="cmd-search-item-icon"
                                style={{
                                  background: "#fff6da",
                                  color: "#896400",
                                }}
                              >
                                <AlertTriangle size={14} />
                              </div>
                              <div className="cmd-search-item-meta">
                                <span className="cmd-search-item-title">
                                  Report {d.id} · {d.category}
                                </span>
                                <span className="cmd-search-item-sub">
                                  {d.road} · {d.agent} · {d.severity}
                                </span>
                              </div>
                            </div>
                            <span
                              className={`cmd-badge-severity ${d.sevClass}`}
                            >
                              {d.severity}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}

                <div className="cmd-search-footer">
                  <span>Press Esc to close</span>
                  <span>Click item to inspect</span>
                </div>
              </div>
            )}
          </div>

          <div className="cmd-topbar-right">
            <button className="cmd-lang-btn" title="Change Language">
              <Globe size={14} />
              <span>EN</span>
              <ChevronDown size={12} />
            </button>

            <div className="cmd-user-profile">
              <div className="cmd-avatar-ic">IC</div>
              <div className="cmd-user-info">
                <strong>Ibrahima Camara</strong>
                <span>National Supervisor</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="cmd-content">
          {/* Header & Filter Controls */}
          <div className="cmd-header-row">
            <div className="cmd-header-top">
              <div className="cmd-title-block">
                <div className="cmd-breadcrumb">
                  <span>COMMAND</span>
                  <span className="sep">/</span>
                  <strong>DASHBOARD</strong>
                </div>
                <h1>Command Dashboard</h1>
                <p>National road surveillance operations overview</p>
              </div>

              <div className="cmd-header-live-badge">
                <div className="cmd-live-status-pill">
                  <span className="cmd-pulse-dot" />
                  <span>Live Operations</span>
                </div>
                <span className="cmd-time-display">{currentTime}</span>
              </div>
            </div>

            <div className="cmd-filters-bar">
              <div className="cmd-filters-left">
                {/* 1. Date Dropdown */}
                <div className="cmd-filter-dropdown-wrap">
                  <button
                    type="button"
                    className={`cmd-filter-pill ${activeDropdown === "date" ? "open" : ""} ${selectedDate !== "05 October 2026" ? "active-filtered" : ""}`}
                    onClick={() => setActiveDropdown(activeDropdown === "date" ? null : "date")}
                  >
                    <Calendar size={13} className="filter-icon" />
                    <span className="filter-label">Date</span>
                    <span className="filter-val">{selectedDate === "05 October 2026" ? "Today" : selectedDate}</span>
                    {selectedDate !== "05 October 2026" && <span className="active-filter-dot" />}
                    <ChevronDown size={12} className="chevron-icon" />
                  </button>

                  {activeDropdown === "date" && (
                    <div className="cmd-filter-dropdown-menu">
                      <div className="cmd-dropdown-menu-header">Select Date Range</div>
                      {dateOptions.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          className={`cmd-filter-dropdown-item ${selectedDate === opt ? "active" : ""}`}
                          onClick={() => {
                            setSelectedDate(opt);
                            setActiveDropdown(null);
                          }}
                        >
                          <span>{opt}</span>
                          {selectedDate === opt && <span className="item-check"><Check size={12} /></span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. All Guinea Scope Dropdown */}
                <div className="cmd-filter-dropdown-wrap">
                  <button
                    type="button"
                    className={`cmd-filter-pill ${activeDropdown === "scope" ? "open" : ""} ${selectedScope !== "All Guinea" ? "active-filtered" : ""}`}
                    onClick={() => setActiveDropdown(activeDropdown === "scope" ? null : "scope")}
                  >
                    <span>{selectedScope}</span>
                    {selectedScope !== "All Guinea" && <span className="active-filter-dot" />}
                    <ChevronDown size={12} className="chevron-icon" />
                  </button>

                  {activeDropdown === "scope" && (
                    <div className="cmd-filter-dropdown-menu">
                      <div className="cmd-dropdown-menu-header">National Scope & Corridors</div>
                      {scopeOptions.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          className={`cmd-filter-dropdown-item ${selectedScope === opt ? "active" : ""}`}
                          onClick={() => {
                            setSelectedScope(opt);
                            setActiveDropdown(null);
                          }}
                        >
                          <span>{opt}</span>
                          {selectedScope === opt && <span className="item-check"><Check size={12} /></span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 3. All Regions Dropdown */}
                <div className="cmd-filter-dropdown-wrap">
                  <button
                    type="button"
                    className={`cmd-filter-pill ${activeDropdown === "region" ? "open" : ""} ${selectedRegion !== "All Regions" ? "active-filtered" : ""}`}
                    onClick={() => setActiveDropdown(activeDropdown === "region" ? null : "region")}
                  >
                    <span>{selectedRegion}</span>
                    {selectedRegion !== "All Regions" && <span className="active-filter-dot" />}
                    <ChevronDown size={12} className="chevron-icon" />
                  </button>

                  {activeDropdown === "region" && (
                    <div className="cmd-filter-dropdown-menu">
                      <div className="cmd-dropdown-menu-header">Administrative Regions</div>
                      {regionOptions.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          className={`cmd-filter-dropdown-item ${selectedRegion === opt ? "active" : ""}`}
                          onClick={() => {
                            setSelectedRegion(opt);
                            setActiveDropdown(null);
                          }}
                        >
                          <span>{opt}</span>
                          {selectedRegion === opt && <span className="item-check"><Check size={12} /></span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 4. All Supervisors Dropdown */}
                <div className="cmd-filter-dropdown-wrap">
                  <button
                    type="button"
                    className={`cmd-filter-pill ${activeDropdown === "supervisor" ? "open" : ""} ${selectedSupervisor !== "All Supervisors" ? "active-filtered" : ""}`}
                    onClick={() => setActiveDropdown(activeDropdown === "supervisor" ? null : "supervisor")}
                  >
                    <span>{selectedSupervisor}</span>
                    {selectedSupervisor !== "All Supervisors" && <span className="active-filter-dot" />}
                    <ChevronDown size={12} className="chevron-icon" />
                  </button>

                  {activeDropdown === "supervisor" && (
                    <div className="cmd-filter-dropdown-menu">
                      <div className="cmd-dropdown-menu-header">Supervisors</div>
                      {supervisorOptions.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          className={`cmd-filter-dropdown-item ${selectedSupervisor === opt ? "active" : ""}`}
                          onClick={() => {
                            setSelectedSupervisor(opt);
                            setActiveDropdown(null);
                          }}
                        >
                          <span>{opt}</span>
                          {selectedSupervisor === opt && <span className="item-check"><Check size={12} /></span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 5. Agent Status Dropdown */}
                <div className="cmd-filter-dropdown-wrap">
                  <button
                    type="button"
                    className={`cmd-filter-pill ${activeDropdown === "status" ? "open" : ""} ${selectedStatus !== "Agent Status" ? "active-filtered" : ""}`}
                    onClick={() => setActiveDropdown(activeDropdown === "status" ? null : "status")}
                  >
                    <span>{selectedStatus}</span>
                    {selectedStatus !== "Agent Status" && <span className="active-filter-dot" />}
                    <ChevronDown size={12} className="chevron-icon" />
                  </button>

                  {activeDropdown === "status" && (
                    <div className="cmd-filter-dropdown-menu">
                      <div className="cmd-dropdown-menu-header">Agent Status</div>
                      {statusOptions.map((opt) => (
                        <button
                          key={opt.label}
                          type="button"
                          className={`cmd-filter-dropdown-item ${selectedStatus === opt.label ? "active" : ""}`}
                          onClick={() => {
                            setSelectedStatus(opt.label === "Agent Status" ? "Agent Status" : opt.label);
                            setActiveDropdown(null);
                          }}
                        >
                          <span>{opt.label}</span>
                          {opt.count !== undefined && (
                            <span className="item-badge">{opt.count}</span>
                          )}
                          {selectedStatus === opt.label && <span className="item-check"><Check size={12} /></span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Reset Filters button */}
                {isFiltered && (
                  <button
                    type="button"
                    className="cmd-filter-reset-btn"
                    onClick={handleResetFilters}
                    title="Reset all filters and search"
                  >
                    <X size={12} />
                    <span>Reset Filters</span>
                  </button>
                )}
              </div>

              <div className="cmd-filter-date-badge">
                <span>{selectedDate}</span>
              </div>
            </div>
          </div>

          {/* 6 KPI Cards Strip */}
          <section className="cmd-kpi-grid">
            {kpiCards.map((card) => (
              <StatCard key={card.label} {...card} />
            ))}
          </section>

          {/* ROW 1: Live Field Operations Map & Agent Detail Card */}
          <section className="cmd-row-operations" id="live-map">
            {/* Live Field Operations Map */}
            <article className="cmd-card cmd-operations-card">
              <header className="cmd-card-header cmd-map-header">
                <div>
                  <h2 className="cmd-card-title">
                    <span className="cmd-pulse-dot" /> Live Field Operations
                    <span className="cmd-map-header-sub">· Updated 20 sec ago</span>
                  </h2>
                </div>

                <div className="cmd-map-header-badges">
                  <span className="cmd-badge-pill badge-green">42 Agents</span>
                  <span className="cmd-badge-pill badge-blue">18 Missions</span>
                  <span className="cmd-badge-pill badge-red">1 Emergency</span>
                </div>
              </header>

              <div className="cmd-map-canvas-wrap">
                <div className="cmd-dark-map-grid" />

                {/* Filter buttons on map */}
                <div className="cmd-map-filter-group">
                  <button type="button" className="cmd-map-btn active">All</button>
                  <button type="button" className="cmd-map-btn inactive">Active</button>
                  <button type="button" className="cmd-map-btn inactive">Emergencies</button>
                </div>

                {/* Tactical SVG Road Network */}
                <svg
                  className="cmd-dark-map-svg"
                  viewBox="0 0 760 300"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <filter
                      id="glow-blue"
                      x="-20%"
                      y="-20%"
                      width="140%"
                      height="140%"
                    >
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                    <filter
                      id="glow-green"
                      x="-20%"
                      y="-20%"
                      width="140%"
                      height="140%"
                    >
                      <feGaussianBlur stdDeviation="2.5" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  {/* Regional corridors */}
                  <path
                    d="M 60 260 Q 220 220 380 180 T 700 80"
                    stroke="#1c3a2d"
                    strokeWidth="10"
                    fill="none"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 120 280 C 200 240, 260 160, 360 140 S 520 180, 680 90"
                    stroke="#1a382f"
                    strokeWidth="8"
                    fill="none"
                  />

                  {/* RN1 Main Corridor */}
                  <path
                    d="M 70 240 C 180 220, 160 120, 300 150 S 460 240, 560 140 S 680 90, 720 50"
                    stroke="#1669aa"
                    strokeWidth="5"
                    fill="none"
                    filter="url(#glow-blue)"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 70 240 C 180 220, 160 120, 300 150 S 460 240, 560 140 S 680 90, 720 50"
                    stroke="#009360"
                    strokeWidth="2.5"
                    strokeDasharray="8 6"
                    fill="none"
                    strokeLinecap="round"
                  />

                  {/* Route Le Prince */}
                  <path
                    d="M 80 270 Q 180 180 260 110"
                    stroke="#009360"
                    strokeWidth="4"
                    fill="none"
                    filter="url(#glow-green)"
                  />

                  {/* RN3 to Kindia */}
                  <path
                    d="M 300 150 Q 420 90 560 70"
                    stroke="#c48900"
                    strokeWidth="3.5"
                    strokeDasharray="5 5"
                    fill="none"
                  />
                </svg>

                {/* Town & Road Pins */}
                <div
                  className="cmd-map-town-pin"
                  style={{ left: "10%", bottom: "22%" }}
                >
                  <span className="cmd-town-dot" />
                  <span>Conakry</span>
                </div>
                <div
                  className="cmd-map-town-pin"
                  style={{ left: "37%", top: "45%" }}
                >
                  <span className="cmd-town-dot" />
                  <span>Coyah</span>
                </div>
                <div
                  className="cmd-map-town-pin"
                  style={{ left: "70%", top: "42%" }}
                >
                  <span className="cmd-town-dot" />
                  <span>Dubréka</span>
                </div>
                <div
                  className="cmd-map-town-pin"
                  style={{ left: "28%", top: "34%" }}
                >
                  <span className="cmd-town-dot" />
                  <span>R. Le Prince</span>
                </div>
                <div
                  className="cmd-map-town-pin"
                  style={{ left: "68%", top: "24%" }}
                >
                  <span className="cmd-town-dot" />
                  <span>RN3</span>
                </div>

                {/* Agent Pins on Map */}
                <button
                  type="button"
                  className="cmd-map-agent-marker marker-agent-md"
                  style={{ left: "38%", top: "48%" }}
                  title="Mamadou Diallo (AGT-1048) — RN1 Coyah"
                  onClick={() => setActiveAgentDetail(displayAgents[0])}
                >
                  <span>⚡</span> MD
                </button>

                <button
                  type="button"
                  className="cmd-map-agent-marker marker-agent-ab"
                  style={{ left: "26%", top: "42%" }}
                  title="Aissatou Bah (AGT-1052) — R. Le Prince"
                  onClick={() => setActiveAgentDetail(displayAgents[1])}
                >
                  <span>!</span> AB RN1
                </button>

                <button
                  type="button"
                  className="cmd-map-agent-marker marker-agent-ac"
                  style={{ left: "71%", top: "44%" }}
                  title="Alpha Condé (AGT-1061) — Dubréka (Offline)"
                  onClick={() => setActiveAgentDetail(displayAgents[2])}
                >
                  <span>✕</span> AC
                </button>

                <button
                  type="button"
                  className="cmd-map-agent-marker marker-agent-mc"
                  style={{ left: "13%", bottom: "24%" }}
                  title="Mariama Camara (AGT-1067) — Conakry"
                  onClick={() => setActiveAgentDetail(displayAgents[3])}
                >
                  MC
                </button>

                {/* Emergency Hazard Marker */}
                <div
                  className="cmd-map-hazard-pin"
                  style={{ left: "47%", top: "58%" }}
                  title="Critical road blockage reported · Coyah RN1 km 7.4"
                >
                  <span>!</span>
                </div>

                {/* Bottom Map Legend */}
                <div className="cmd-map-legend-pill">
                  <span className="cmd-legend-item">
                    <span className="legend-dot dot-mission" /> On Mission
                  </span>
                  <span className="cmd-legend-item">
                    <span className="legend-dot dot-inspecting" /> Inspecting
                  </span>
                  <span className="cmd-legend-item">
                    <span className="legend-dot dot-available" /> Available
                  </span>
                  <span className="cmd-legend-item">
                    <span className="legend-dot dot-offline" /> Offline
                  </span>
                </div>

                {/* Zoom buttons */}
                <div className="cmd-map-zoom-group">
                  <button type="button" className="cmd-map-zoom-btn" title="Zoom in">+</button>
                  <button type="button" className="cmd-map-zoom-btn" title="Zoom out">-</button>
                  <button type="button" className="cmd-map-zoom-btn" title="Reset view">⌖</button>
                </div>
              </div>
            </article>

            {/* Agent Detail Card */}
            <article className="cmd-card cmd-agent-detail-card">
              <div>
                <header className="cmd-card-header">
                  <h2 className="cmd-card-title">Agent Detail</h2>
                </header>

                <div className="cmd-agent-profile-head">
                  <div className="cmd-agent-avatar-lg">
                    {activeInspector.initials}
                    <span className="cmd-avatar-dot" />
                  </div>
                  <div className="cmd-agent-meta">
                    <h3>{activeInspector.name}</h3>
                    <p>
                      {activeInspector.badgeNumber} · {activeInspector.role}
                    </p>
                  </div>
                </div>

                <div className="cmd-agent-status-badge">
                  ● {activeInspector.statusLabel}
                </div>

                <div className="cmd-agent-box">
                  <div className="cmd-agent-box-row">
                    <span className="lbl">Mission</span>
                    <span className="val" style={{ fontFamily: "monospace", fontSize: "10.5px" }}>
                      {activeInspector.missionCode}
                    </span>
                  </div>
                  <div className="cmd-agent-box-row">
                    <span className="lbl">Road</span>
                    <span className="val">{activeInspector.road}</span>
                  </div>
                  <div className="cmd-agent-box-row">
                    <span className="lbl">Route</span>
                    <span className="val" style={{ fontSize: "10.5px" }}>{activeInspector.route}</span>
                  </div>
                  <div className="cmd-agent-box-row">
                    <span className="lbl">Progress</span>
                    <span className="val">{activeInspector.progress}%</span>
                  </div>
                  <div className="cmd-agent-box-row">
                    <span className="lbl">GPS</span>
                    <span className="val" style={{ color: "#009360" }}>
                      ● {activeInspector.gps}
                    </span>
                  </div>
                  <div className="cmd-agent-box-row">
                    <span className="lbl">Connection</span>
                    <span
                      className="val"
                      style={{
                        color:
                          activeInspector.connection === "Online"
                            ? "#009360"
                            : "#cd1126",
                      }}
                    >
                      ● {activeInspector.connection}
                    </span>
                  </div>
                  <div className="cmd-agent-box-row">
                    <span className="lbl">Duty started</span>
                    <span className="val">{activeInspector.dutyStart}</span>
                  </div>
                  <div className="cmd-agent-box-row">
                    <span className="lbl">Last sync</span>
                    <span className="val">{activeInspector.syncAgo}</span>
                  </div>
                  <div className="cmd-agent-box-row">
                    <span className="lbl">Cash today</span>
                    <span className="val" style={{ fontWeight: 750 }}>{activeInspector.cashToday}</span>
                  </div>
                </div>

                <div className="cmd-mission-prog-wrap">
                  <div className="cmd-mission-prog-label">
                    <span>Mission progress</span>
                    <span>{activeInspector.progress}%</span>
                  </div>
                  <div className="cmd-mission-prog-track">
                    <div
                      className="cmd-mission-prog-fill"
                      style={{ width: `${activeInspector.progress}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="cmd-agent-action-btns">
                <button
                  type="button"
                  className="cmd-btn-agent-primary"
                  onClick={() => setSelectedAgent(activeInspector)}
                >
                  View Agent →
                </button>
                <button
                  type="button"
                  className="cmd-btn-agent-secondary"
                  onClick={() => {
                    if (activeInspector.missions?.length > 0) {
                      setSelectedMission(activeInspector);
                    } else {
                      setSelectedAgent(activeInspector);
                    }
                  }}
                >
                  View Mission →
                </button>
              </div>
            </article>
          </section>

          {/* ROW 2: Live Agents (Full Width) */}
          <article className="cmd-card cmd-card-full" id="agents">
            <header className="cmd-card-header">
              <div>
                <h2 className="cmd-card-title">Live Agents</h2>
                <p className="cmd-card-subtitle">Current field activity</p>
              </div>
              <button
                type="button"
                className="cmd-card-action"
              // onClick={() => setSelectedAgent(displayAgents[0])}
              >
                View all agents <ExternalLink size={12} />
              </button>
            </header>

            <div className="cmd-table-container">
              <table className="cmd-table-modern">
                <thead>
                  <tr>
                    <th>Agent</th>
                    <th>Status</th>
                    <th>Mission</th>
                    <th>Location</th>
                    <th>Duty</th>
                    <th>Sync</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAgents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="cmd-table-empty-cell">
                        No agents match the selected filters or search query.
                      </td>
                    </tr>
                  ) : (
                    filteredAgents.map((ag) => (
                      <tr
                        key={ag.id}
                        onClick={() => setActiveAgentDetail(ag)}
                        title="Click to view details in card"
                      >
                        <td>
                          <div className="cmd-table-agent-info">
                            <div className="cmd-table-agent-avatar">
                              {ag.initials}
                            </div>
                            <div className="cmd-table-agent-name">
                              <strong>{ag.name}</strong>
                              <small>{ag.badgeNumber}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span
                            className={`cmd-status-pill ${ag.status === "ON_MISSION"
                              ? "status-on-mission"
                              : ag.status === "INSPECTING"
                                ? "status-inspecting"
                                : ag.status === "AVAILABLE"
                                  ? "status-available"
                                  : "status-offline"
                              }`}
                          >
                            <span className="dot" />
                            {ag.statusLabel}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontFamily: "monospace", color: "#1669aa" }}>
                            {ag.shortMission}
                          </span>
                        </td>
                        <td>{ag.location}</td>
                        <td>{ag.duty}</td>
                        <td>
                          <span className="cmd-sync-status">
                            <span
                              className={`dot ${ag.syncClass === "sync-offline"
                                ? "sync-dot-red"
                                : "sync-dot-green"
                                }`}
                            />
                            {ag.sync}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </article>

          {/* ROW 3: Active Missions (Full Width) */}
          <article className="cmd-card cmd-card-full" id="missions">
            <header className="cmd-card-header">
              <div>
                <h2 className="cmd-card-title">Active Missions</h2>
                <p className="cmd-card-subtitle">Currently in progress</p>
              </div>
              <button
                type="button"
                className="cmd-card-action"
              // onClick={() => setSelectedMission(displayAgents[0])}
              >
                View all missions <ExternalLink size={12} />
              </button>
            </header>

            <div className="cmd-table-container">
              <table className="cmd-table-modern">
                <thead>
                  <tr>
                    <th>Mission</th>
                    <th>Agent</th>
                    <th>Road</th>
                    <th>Route</th>
                    <th>Progress</th>
                    <th>Duration</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMissions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="cmd-table-empty-cell">
                        No active missions match the selected filters or search query.
                      </td>
                    </tr>
                  ) : (
                    filteredMissions.map((msn) => (
                      <tr
                        key={msn.id}
                        onClick={() => {
                          const ag =
                            displayAgents.find(
                              (a) => a.id === msn.agentId,
                            ) || displayAgents[0];
                          setSelectedMission(ag);
                        }}
                        title="Click to open mission drawer"
                      >
                        <td>
                          <strong style={{ color: "#1669aa", fontFamily: "monospace" }}>
                            {msn.id}
                          </strong>
                        </td>
                        <td>
                          <strong>{msn.agentName}</strong>
                        </td>
                        <td>{msn.road}</td>
                        <td>{msn.route}</td>
                        <td>
                          <div className="cmd-table-progress-wrap">
                            <div className="cmd-table-progress-track">
                              <div
                                className="cmd-table-progress-fill"
                                style={{ width: `${msn.progress}%` }}
                              />
                            </div>
                            <span className="cmd-table-progress-val">
                              {msn.progress}%
                            </span>
                          </div>
                        </td>
                        <td>{msn.duration}</td>
                        <td>
                          <span className="cmd-status-pill status-on-mission">
                            <span className="dot" />
                            {msn.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </article>

          {/* ROW 3: Road Damage & Enforcement */}
          <section className="cmd-row-split-2" id="damage-reports">
            {/* Road Damage Card */}
            <article className="cmd-card">
              <header className="cmd-card-header">
                <div>
                  <h2 className="cmd-card-title">Road Damage</h2>
                  <p className="cmd-card-subtitle">27 reports today</p>
                </div>
                <button type="button" className="cmd-card-action">
                  View all <ExternalLink size={12} />
                </button>
              </header>

              <div className="cmd-damage-summary">
                {/* By Severity */}
                <div>
                  <div className="cmd-damage-col-title">BY SEVERITY</div>
                  <div className="cmd-bar-stat-row">
                    <span className="cmd-bar-label">Minor</span>
                    <div className="cmd-bar-track">
                      <div
                        className="cmd-bar-fill fill-minor"
                        style={{ width: "30%" }}
                      />
                    </div>
                    <span className="cmd-bar-val">8</span>
                  </div>
                  <div className="cmd-bar-stat-row">
                    <span className="cmd-bar-label">Moderate</span>
                    <div className="cmd-bar-track">
                      <div
                        className="cmd-bar-fill fill-moderate"
                        style={{ width: "35%" }}
                      />
                    </div>
                    <span className="cmd-bar-val">9</span>
                  </div>
                  <div className="cmd-bar-stat-row">
                    <span className="cmd-bar-label">Severe</span>
                    <div className="cmd-bar-track">
                      <div
                        className="cmd-bar-fill fill-severe"
                        style={{ width: "12%" }}
                      />
                    </div>
                    <span className="cmd-bar-val">3</span>
                  </div>
                  <div className="cmd-bar-stat-row">
                    <span className="cmd-bar-label">Very Severe</span>
                    <div className="cmd-bar-track">
                      <div
                        className="cmd-bar-fill fill-very-severe"
                        style={{ width: "8%" }}
                      />
                    </div>
                    <span className="cmd-bar-val">2</span>
                  </div>
                  <div className="cmd-bar-stat-row">
                    <span className="cmd-bar-label">Critical</span>
                    <div className="cmd-bar-track">
                      <div
                        className="cmd-bar-fill fill-critical"
                        style={{ width: "8%" }}
                      />
                    </div>
                    <span className="cmd-bar-val" style={{ color: "#dc2626" }}>
                      2
                    </span>
                  </div>
                </div>

                {/* By Status */}
                <div>
                  <div className="cmd-damage-col-title">BY STATUS</div>
                  <div className="cmd-status-tags-grid">
                    <div className="cmd-status-tag-box">
                      <span>Reported</span>
                      <strong>27</strong>
                    </div>
                    <div className="cmd-status-tag-box">
                      <span>Validated</span>
                      <strong>15</strong>
                    </div>
                    <div className="cmd-status-tag-box">
                      <span>Assigned</span>
                      <strong>8</strong>
                    </div>
                    <div className="cmd-status-tag-box">
                      <span>In Progress</span>
                      <strong>6</strong>
                    </div>
                    <div className="cmd-status-tag-box">
                      <span>Awaiting Verif.</span>
                      <strong>4</strong>
                    </div>
                    <div className="cmd-status-tag-box">
                      <span>Closed</span>
                      <strong>3</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mini reports table */}
              <div className="cmd-table-container">
                <table className="cmd-table-modern">
                  <thead>
                    <tr>
                      <th>Report</th>
                      <th>Road</th>
                      <th>Agent</th>
                      <th>Category</th>
                      <th>Severity</th>
                      <th>Time</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDamageReports.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="cmd-table-empty-cell">
                          No damage reports match the selected filters or search query.
                        </td>
                      </tr>
                    ) : (
                      filteredDamageReports.map((d) => (
                        <tr key={d.id}>
                          <td>
                            <strong style={{ fontFamily: "monospace", color: "#1669aa" }}>
                              {d.id}
                            </strong>
                          </td>
                          <td>{d.road}</td>
                          <td>{d.agent}</td>
                          <td>{d.category}</td>
                          <td>
                            <span className={`cmd-badge-severity ${d.sevClass}`}>
                              {d.severity}
                            </span>
                          </td>
                          <td>{d.time}</td>
                          <td>
                            <span className={`cmd-status-pill ${d.statusClass}`}>
                              <span className="dot" /> {d.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </article>

            {/* Enforcement Card */}
            <article className="cmd-card" id="enforcement">
              <header className="cmd-card-header">
                <div>
                  <h2 className="cmd-card-title">Enforcement</h2>
                  <p className="cmd-card-subtitle">
                    {filteredViolations.length} violations today · GNF 12.85M
                  </p>
                </div>
                <button type="button" className="cmd-card-action">
                  View all <ExternalLink size={12} />
                </button>
              </header>

              <div className="cmd-enforcement-kpi-row">
                <div className="cmd-enf-box">
                  <span className="val">{filteredViolations.length}</span>
                  <span className="lbl">Violations</span>
                </div>
                <div className="cmd-enf-box">
                  <span className="val">{isFiltered ? Math.min(filteredViolations.length, 2) : 4}</span>
                  <span className="lbl">Heavy Vehicle</span>
                </div>
                <div className="cmd-enf-box">
                  <span className="val">
                    {isFiltered && filteredViolations.length < 4
                      ? `GNF ${(filteredViolations.length * 0.7).toFixed(2)}M`
                      : "GNF 12.85M"}
                  </span>
                  <span className="lbl">Fine Value</span>
                </div>
                <div className="cmd-enf-box">
                  <span className="val" style={{ color: "#cd1126" }}>
                    {isFiltered && filteredViolations.length < 4
                      ? `GNF ${(filteredViolations.length * 0.25).toFixed(2)}M`
                      : "GNF 4.6M"}
                  </span>
                  <span className="lbl">Unpaid</span>
                </div>
              </div>

              {/* Mini Violations Table */}
              <div className="cmd-table-container">
                <table className="cmd-table-modern">
                  <thead>
                    <tr>
                      <th>VIO ID</th>
                      <th>Agent</th>
                      <th>Vehicle/Co.</th>
                      <th>Road</th>
                      <th>Type</th>
                      <th>Sev.</th>
                      <th>Fine</th>
                      <th>Payment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredViolations.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="cmd-table-empty-cell">
                          No violations recorded matching the selected filters or search query.
                        </td>
                      </tr>
                    ) : (
                      filteredViolations.map((v) => (
                        <tr key={v.id}>
                          <td>
                            <strong style={{ fontFamily: "monospace", color: "#1669aa" }}>
                              {v.id}
                            </strong>
                          </td>
                          <td>{v.agent}</td>
                          <td>{v.vehicle}</td>
                          <td>{v.road}</td>
                          <td>{v.type}</td>
                          <td>
                            <span className={`cmd-badge-severity ${v.sevClass}`}>
                              {v.severity}
                            </span>
                          </td>
                          <td>
                            <strong>{v.fine}</strong>
                          </td>
                          <td>
                            <span className={`cmd-status-pill ${v.paymentClass}`}>
                              {v.payment}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </article>
          </section>

          {/* ROW 4: Finance Snapshot & Mobile Sync Health */}
          <section className="cmd-row-split-2" id="finance">
            {/* Finance Snapshot Card */}
            <article className="cmd-card">
              <header className="cmd-card-header">
                <div>
                  <h2 className="cmd-card-title">Finance Snapshot</h2>
                  <p className="cmd-card-subtitle">05 October 2026</p>
                </div>
                <button type="button" className="cmd-card-action">
                  View finance <ExternalLink size={12} />
                </button>
              </header>

              <div className="cmd-finance-grid">
                <div className="cmd-finance-box">
                  <span className="lbl">Fine Value Issued</span>
                  <span className="amount">GNF 12,850,000</span>
                  <span className="sub">19 violations</span>
                </div>
                <div className="cmd-finance-box">
                  <span className="lbl">Cash Collected</span>
                  <span className="amount">GNF 5,400,000</span>
                  <span className="sub">14 agents</span>
                </div>
                <div className="cmd-finance-box">
                  <span className="lbl">Mobile Money</span>
                  <span className="amount">GNF 2,100,000</span>
                  <span className="sub">Digital payments</span>
                </div>
                <div className="cmd-finance-box">
                  <span className="lbl">Pending Remittance</span>
                  <span className="amount" style={{ color: "#c2410c" }}>
                    GNF 1,250,000
                  </span>
                  <span className="sub">6 agents pending</span>
                </div>
                <div className="cmd-finance-box">
                  <span className="lbl">Pending Reconciliation</span>
                  <span className="amount" style={{ color: "#c2410c" }}>
                    GNF 780,000
                  </span>
                  <span className="sub">2 batches</span>
                </div>
                <div className="cmd-finance-box">
                  <span className="lbl">Reconciled Today</span>
                  <span className="amount" style={{ color: "#16a34a" }}>
                    GNF 3,370,000
                  </span>
                  <span className="sub">Verified ✓</span>
                </div>
              </div>

              {/* Discrepancy Alert */}
              <div className="cmd-alert-banner">
                <div className="cmd-alert-banner-left">
                  <AlertTriangle size={15} color="#b45309" />
                  <div>
                    <strong>Reconciliation discrepancy detected</strong>
                    <div style={{ fontSize: "10.5px", marginTop: "1px" }}>
                      AGT 1041 · Expected: GNF 850,000 · Submitted: GNF 700,000 · Δ GNF 150,000
                    </div>
                  </div>
                </div>
                <button type="button" className="cmd-alert-btn">
                  Review
                </button>
              </div>
            </article>

            {/* Mobile Sync Health Card */}
            <article className="cmd-card">
              <header className="cmd-card-header">
                <div>
                  <h2 className="cmd-card-title">Mobile Sync Health</h2>
                  <p className="cmd-card-subtitle">
                    Agent connectivity & data sync
                  </p>
                </div>
                <button type="button" className="cmd-card-action">
                  View sync <ExternalLink size={12} />
                </button>
              </header>

              <div className="cmd-sync-kpi-row">
                <div className="cmd-sync-kpi sync-online">
                  <span className="val">42</span>
                  <span className="lbl">Online</span>
                </div>
                <div className="cmd-sync-kpi sync-offline">
                  <span className="val">6</span>
                  <span className="lbl">Offline</span>
                </div>
                <div className="cmd-sync-kpi sync-pending">
                  <span className="val">9</span>
                  <span className="lbl">Pending Sync</span>
                </div>
                <div className="cmd-sync-kpi sync-failed">
                  <span className="val">2</span>
                  <span className="lbl">Failed Records</span>
                </div>
                <div className="cmd-sync-kpi sync-time">
                  <span className="val">34 min</span>
                  <span className="lbl">Longest Offline</span>
                </div>
              </div>

              <div className="cmd-info-notice">
                Pending records are stored on-device and have NOT been received by the admin backend.
              </div>

              {/* Sync Table */}
              <div className="cmd-table-container">
                <table className="cmd-table-modern">
                  <thead>
                    <tr>
                      <th>Agent</th>
                      <th>Mission</th>
                      <th>Last Sync</th>
                      <th>Pending</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSyncAgents.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="cmd-table-empty-cell">
                          All devices synchronized or no unsynced agents match filters.
                        </td>
                      </tr>
                    ) : (
                      filteredSyncAgents.map((s, idx) => (
                        <tr key={idx}>
                          <td>
                            <div className="cmd-table-agent-info">
                              <div className="cmd-table-agent-name">
                                <strong>{s.agent}</strong>
                                <small>{s.badge}</small>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span style={{ fontFamily: "monospace", color: "#1669aa" }}>
                              {s.mission}
                            </span>
                          </td>
                          <td>{s.lastSync}</td>
                          <td>
                            <span style={{ color: "#896400", fontWeight: 700 }}>
                              {s.pending}
                            </span>
                          </td>
                          <td>
                            <span className={`cmd-status-pill ${s.statusClass}`}>
                              <span className="dot" /> {s.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </article>
          </section>

          {/* ROW 5: Inspection Coverage & Agent Distribution (50/50 Split) */}
          <section className="cmd-row-split-2" id="reports">
            {/* Inspection Coverage Card */}
            <article className="cmd-card">
              <header className="cmd-card-header">
                <div>
                  <h2 className="cmd-card-title">Inspection Coverage</h2>
                  <p className="cmd-card-subtitle">Today · National</p>
                </div>
              </header>

              <div className="cmd-coverage-stat-row">
                <div className="cmd-cov-block">
                  <div className="val">{stats?.totalKm ? `${stats.totalKm} km` : "164 km"}</div>
                  <div className="lbl">Assigned</div>
                </div>
                <div className="cmd-cov-block">
                  <div className="val">{stats?.coveredKm ? `${stats.coveredKm} km` : "126 km"}</div>
                  <div className="lbl">Inspected</div>
                </div>
                <div className="cmd-cov-block">
                  <div className="val" style={{ color: "#009360" }}>
                    {stats?.coveragePercent ? `${stats.coveragePercent}%` : "77%"}
                  </div>
                  <div className="lbl">Completion</div>
                </div>
              </div>

              <div className="cmd-region-list">
                <div className="cmd-region-row">
                  <span className="cmd-region-name">Conakry</span>
                  <div className="cmd-region-bar-wrap">
                    <div
                      className="cmd-region-bar-fill"
                      style={{ width: "84%", background: "#009360" }}
                    />
                  </div>
                  <span className="cmd-region-pct">84%</span>
                </div>
                <div className="cmd-region-row">
                  <span className="cmd-region-name">Kindia</span>
                  <div className="cmd-region-bar-wrap">
                    <div
                      className="cmd-region-bar-fill"
                      style={{ width: "71%", background: "#009360" }}
                    />
                  </div>
                  <span className="cmd-region-pct">71%</span>
                </div>
                <div className="cmd-region-row">
                  <span className="cmd-region-name">Boké</span>
                  <div className="cmd-region-bar-wrap">
                    <div
                      className="cmd-region-bar-fill"
                      style={{ width: "68%", background: "#c48900" }}
                    />
                  </div>
                  <span className="cmd-region-pct">68%</span>
                </div>
                <div className="cmd-region-row">
                  <span className="cmd-region-name">Mamou</span>
                  <div className="cmd-region-bar-wrap">
                    <div
                      className="cmd-region-bar-fill"
                      style={{ width: "55%", background: "#c48900" }}
                    />
                  </div>
                  <span className="cmd-region-pct">55%</span>
                </div>
                <div className="cmd-region-row">
                  <span className="cmd-region-name">Labé</span>
                  <div className="cmd-region-bar-wrap">
                    <div
                      className="cmd-region-bar-fill"
                      style={{ width: "42%", background: "#cd1126" }}
                    />
                  </div>
                  <span className="cmd-region-pct">42%</span>
                </div>
              </div>
            </article>

            {/* Agent Distribution Card */}
            <article className="cmd-card">
              <header className="cmd-card-header">
                <div>
                  <h2 className="cmd-card-title">Agent Distribution</h2>
                  <p className="cmd-card-subtitle">51 total enrolled</p>
                </div>
              </header>

              <div className="cmd-dist-list">
                <div className="cmd-dist-row">
                  <span className="cmd-dist-label">Available</span>
                  <div className="cmd-dist-bar-wrap">
                    <div
                      className="cmd-dist-bar-fill"
                      style={{ width: "24%", background: "#009360" }}
                    />
                  </div>
                  <span className="cmd-dist-val">12</span>
                </div>
                <div className="cmd-dist-row">
                  <span className="cmd-dist-label">On Mission</span>
                  <div className="cmd-dist-bar-wrap">
                    <div
                      className="cmd-dist-bar-fill"
                      style={{ width: "36%", background: "#1669aa" }}
                    />
                  </div>
                  <span className="cmd-dist-val">18</span>
                </div>
                <div className="cmd-dist-row">
                  <span className="cmd-dist-label">Inspecting</span>
                  <div className="cmd-dist-bar-wrap">
                    <div
                      className="cmd-dist-bar-fill"
                      style={{ width: "18%", background: "#0a6e5d" }}
                    />
                  </div>
                  <span className="cmd-dist-val">9</span>
                </div>
                <div className="cmd-dist-row">
                  <span className="cmd-dist-label">Fine in Progress</span>
                  <div className="cmd-dist-bar-wrap">
                    <div
                      className="cmd-dist-bar-fill"
                      style={{ width: "4%", background: "#c48900" }}
                    />
                  </div>
                  <span className="cmd-dist-val">2</span>
                </div>
                <div className="cmd-dist-row">
                  <span className="cmd-dist-label">Break</span>
                  <div className="cmd-dist-bar-wrap">
                    <div
                      className="cmd-dist-bar-fill"
                      style={{ width: "6%", background: "#c48900" }}
                    />
                  </div>
                  <span className="cmd-dist-val">3</span>
                </div>
                <div className="cmd-dist-row">
                  <span className="cmd-dist-label">Emergency</span>
                  <div className="cmd-dist-bar-wrap">
                    <div
                      className="cmd-dist-bar-fill"
                      style={{ width: "2%", background: "#cd1126" }}
                    />
                  </div>
                  <span className="cmd-dist-val" style={{ color: "#cd1126" }}>
                    1
                  </span>
                </div>
                <div className="cmd-dist-row">
                  <span className="cmd-dist-label">Offline</span>
                  <div className="cmd-dist-bar-wrap">
                    <div
                      className="cmd-dist-bar-fill"
                      style={{ width: "12%", background: "#6d7c77" }}
                    />
                  </div>
                  <span className="cmd-dist-val">6</span>
                </div>
              </div>
            </article>
          </section>

          {/* ROW 6: Recent Activity (Full Width 100%) */}
          <section className="cmd-row-full" id="audit">
            <article className="cmd-card">
              <header className="cmd-card-header">
                <div>
                  <h2 className="cmd-card-title">Recent Activity</h2>
                  <p className="cmd-card-subtitle">Live operational feed</p>
                </div>
                <button type="button" className="cmd-card-action">
                  View audit log <ExternalLink size={12} />
                </button>
              </header>

              <div className="cmd-activity-feed">
                {filteredActivities.length === 0 ? (
                  <div className="cmd-search-empty" style={{ padding: "20px" }}>
                    No recent activities match the selected filters or search query.
                  </div>
                ) : (
                  filteredActivities.map((act) => {
                    const IconComponent =
                      act.type === "damage"
                        ? AlertTriangle
                        : act.type === "mission"
                          ? CheckCircle2
                          : act.type === "violation"
                            ? ShieldAlert
                            : act.type === "cash"
                              ? DollarSign
                              : act.type === "road"
                                ? AlertOctagon
                                : WifiOff;

                    return (
                      <div className="cmd-activity-item" key={act.id}>
                        <span className="cmd-activity-time">{act.time}</span>
                        <div className={`cmd-activity-icon-wrap ${act.iconClass}`}>
                          <IconComponent size={14} />
                        </div>
                        <div className="cmd-activity-body">
                          <strong style={act.type === "road" ? { color: "#cd1126" } : undefined}>
                            {act.title}
                          </strong>
                          <p>{act.desc}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </article>
          </section>
        </div>

        {/* Selected Agent Modal */}
        {selectedAgent && (
          <div
            className="modal-backdrop"
            onClick={() => setSelectedAgent(null)}
            role="presentation"
          >
            <section
              className="agent-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="agent-modal-title"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="modal-close"
                onClick={() => setSelectedAgent(null)}
              >
                ×
              </button>
              <div className="eyebrow">FIELD AGENT DETAILS</div>
              <h2 id="agent-modal-title">{selectedAgent.name}</h2>
              <p>Badge: {selectedAgent.badgeNumber}</p>
              <p style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span>Status:</span>
                <select
                  value={selectedAgent.status}
                  onChange={(e) => {
                    const newStatus = e.target.value;
                    handleUpdateStatus(selectedAgent.id, newStatus);
                    setSelectedAgent({ ...selectedAgent, status: newStatus });
                  }}
                  style={{
                    padding: "4px 8px",
                    borderRadius: "6px",
                    border: "1px solid #d1d5db",
                    background: "#ffffff",
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  <option value="ON_DUTY">On Duty</option>
                  <option value="ON_MISSION">On Mission</option>
                  <option value="INSPECTING">Inspecting</option>
                  <option value="AVAILABLE">Available</option>
                  <option value="BREAK">On Break</option>
                  <option value="OFFLINE">Offline</option>
                  <option value="EMERGENCY">Emergency</option>
                </select>
              </p>
              <p>Latitude: {selectedAgent.lat}</p>
              <p>Longitude: {selectedAgent.lng}</p>
              <div
                style={{ display: "flex", gap: "10px", marginTop: "14px" }}
              >
                {selectedAgent.missions?.length > 0 && (
                  <button
                    className="primary-button"
                    onClick={() => {
                      setSelectedMission(selectedAgent);
                      setSelectedAgent(null);
                    }}
                  >
                    View Active Mission
                  </button>
                )}
                <button
                  className={
                    selectedAgent.missions?.length > 0
                      ? "icon-button"
                      : "primary-button"
                  }
                  onClick={() => setSelectedAgent(null)}
                >
                  Close
                </button>
              </div>
            </section>
          </div>
        )}

        {/* Live Mission Drawer */}
        <MissionDrawer
          mission={selectedMission}
          agent={
            selectedMission
              ? selectedMission.badgeNumber
                ? selectedMission
                : displayAgents.find(
                  (item) =>
                    item.id === selectedMission.agentId ||
                    item.missions?.some((m) => m.id === selectedMission.id),
                )
              : null
          }
          agents={displayAgents}
          onSelectMission={setSelectedMission}
          onSelectAgent={(ag) => {
            setSelectedAgent(ag);
            setSelectedMission(null);
          }}
          onClose={() => setSelectedMission(null)}
        />
      </main>
    </div>
  );
}
