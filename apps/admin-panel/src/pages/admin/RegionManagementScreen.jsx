import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Globe,
  Search,
  RefreshCw,
  Building2,
  Truck,
  MapPin,
  AlertCircle,
  X,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import adminAPI from "@shared/api/adminAPI";

export default function RegionManagementScreen() {
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [regions, setRegions] = useState([]);
  const [summary, setSummary] = useState({
    totalRegions: 0,
    activeRegions: 0,
    totalBusinesses: 0,
    totalVendors: 0,
    unassignedBusinesses: 0,
    unassignedVendors: 0,
  });

  // Active view filters
  const [selectedRegionCode, setSelectedRegionCode] = useState("all"); // 'all' | 'unassigned' | REGION_CODE
  const [selectedState, setSelectedState] = useState("all");
  const [selectedCity, setSelectedCity] = useState("all");
  const [entityType, setEntityType] = useState("all"); // 'all' | 'business' | 'vendor'
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  // Region Data Table
  const [entities, setEntities] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 50,
    pages: 1,
  });

  // Assign Region Modal
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignEntity, setAssignEntity] = useState(null);
  const [selectedAssignRegionId, setSelectedAssignRegionId] = useState("");

  // Helper to extract clean error message from axiosClient rejection
  const getErrMsg = (err, fallback) =>
    err?.message || err?.data?.message || err?.response?.data?.message || fallback;

  // Load Region master list and summary stats
  const fetchRegions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getRegions();
      if (res?.success) {
        setRegions(res.regions || []);
        if (res.summary) setSummary(res.summary);
      }
    } catch (err) {
      toast.error(getErrMsg(err, "Failed to load regions list."));
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch region-wise businesses and vendors
  const fetchRegionData = useCallback(async () => {
    try {
      setDataLoading(true);
      const res = await adminAPI.getRegionData({
        regionCode: selectedRegionCode,
        state: selectedState,
        city: selectedCity,
        entityType,
        search: searchQuery,
        page,
        limit: 50,
      });

      if (res?.success) {
        setEntities(res.data || []);
        if (res.pagination) setPagination(res.pagination);
        if (res.summary) setSummary(res.summary);
      }
    } catch (err) {
      toast.error(getErrMsg(err, "Failed to load region entities."));
    } finally {
      setDataLoading(false);
    }
  }, [selectedRegionCode, selectedState, selectedCity, entityType, searchQuery, page]);

  useEffect(() => {
    fetchRegions();
  }, [fetchRegions]);

  useEffect(() => {
    fetchRegionData();
  }, [fetchRegionData]);

  // Handle Assign Region
  const handleSaveAssignment = async () => {
    if (!assignEntity) return;
    try {
      const res = await adminAPI.assignRegion({
        entityId: assignEntity.id,
        entityType: assignEntity.entityType,
        regionId: selectedAssignRegionId || null,
      });

      if (res?.success) {
        toast.success(`Region updated for ${assignEntity.name}`);
        setIsAssignModalOpen(false);
        setAssignEntity(null);
        fetchRegions();
        fetchRegionData();
      }
    } catch (err) {
      toast.error(getErrMsg(err, "Failed to assign region."));
    }
  };

  // Compute dynamic lists of available states and cities from current entities
  const availableStates = useMemo(() => {
    const statesMap = new Map();
    entities.forEach((e) => {
      if (e.state && e.state.trim()) {
        const s = e.state.trim();
        statesMap.set(s, (statesMap.get(s) || 0) + 1);
      }
    });
    return Array.from(statesMap.entries()).map(([name, count]) => ({ name, count }));
  }, [entities]);

  const availableCities = useMemo(() => {
    const citiesMap = new Map();
    entities.forEach((e) => {
      if (selectedState !== "all" && e.state !== selectedState) return;
      if (e.city && e.city.trim()) {
        const c = e.city.trim();
        citiesMap.set(c, (citiesMap.get(c) || 0) + 1);
      }
    });
    return Array.from(citiesMap.entries()).map(([name, count]) => ({ name, count }));
  }, [entities, selectedState]);

  // Filter entities locally by city if selected
  const displayEntities = useMemo(() => {
    if (selectedCity === "all") return entities;
    return entities.filter(
      (e) => (e.city || "").trim().toLowerCase() === selectedCity.toLowerCase()
    );
  }, [entities, selectedCity]);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-indigo-900/50">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-indigo-500/20 text-indigo-300 text-xs font-semibold px-2.5 py-1 rounded-full border border-indigo-500/30 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-indigo-400" /> SuperAdmin Territory Control
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Region Management Module
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
              Inspect and organize all businesses and vendors region-wise. Monitor localized assignments and territory coverage seamlessly.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                fetchRegions();
                fetchRegionData();
              }}
              className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all border border-white/10 cursor-pointer flex items-center gap-2 text-xs font-semibold"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${dataLoading ? "animate-spin" : ""}`} /> Refresh
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Regions</span>
            <div className="w-9 h-9 bg-indigo-100 dark:bg-indigo-950/60 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Globe className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{summary.totalRegions}</span>
            <span className="text-xs text-emerald-600 font-semibold">{summary.activeRegions} Active</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Entities</span>
            <div className="w-9 h-9 bg-blue-100 dark:bg-blue-950/60 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{summary.totalBusinesses + summary.totalVendors}</span>
            <span className="text-xs text-indigo-600 font-medium">Businesses & Vendors</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Assigned Entities</span>
            <div className="w-9 h-9 bg-purple-100 dark:bg-purple-950/60 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {(summary.totalBusinesses + summary.totalVendors) - (summary.unassignedBusinesses + summary.unassignedVendors)}
            </span>
            <span className="text-xs text-emerald-600 font-semibold">Territory Mapped</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Unassigned Entities</span>
            <div className="w-9 h-9 bg-amber-100 dark:bg-amber-950/60 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-600">
              {summary.unassignedBusinesses + summary.unassignedVendors}
            </span>
            <span className="text-xs text-slate-500">Need Territory</span>
          </div>
        </div>
      </div>

      {/* Main Container: Region Entities List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-6 space-y-5">
          {/* Top Filters & Search Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Territory / Region Quick Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
              <button
                onClick={() => {
                  setSelectedRegionCode("all");
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedRegionCode === "all"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                All Regions ({summary.totalBusinesses + summary.totalVendors})
              </button>

              <button
                onClick={() => {
                  setSelectedRegionCode("unassigned");
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                  selectedRegionCode === "unassigned"
                    ? "bg-amber-600 text-white shadow-sm"
                    : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100"
                }`}
              >
                <AlertCircle className="w-3.5 h-3.5" />
                Unassigned ({summary.unassignedBusinesses + summary.unassignedVendors})
              </button>

              {regions.map((reg) => {
                const isActive = selectedRegionCode === reg.code;
                const entityCount = reg.totalEntities ?? ((reg.businessCount || 0) + (reg.vendorCount || 0));
                return (
                  <button
                    key={reg._id}
                    onClick={() => {
                      setSelectedRegionCode(isActive ? "all" : reg.code);
                      setPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    <span>{reg.name}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {entityCount}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Entity Type Filter */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  onClick={() => {
                    setEntityType("all");
                    setPage(1);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    entityType === "all" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs" : "text-slate-500"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => {
                    setEntityType("business");
                    setPage(1);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    entityType === "business" ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs" : "text-slate-500"
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" /> Businesses ({summary.totalBusinesses})
                </button>
                <button
                  onClick={() => {
                    setEntityType("vendor");
                    setPage(1);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    entityType === "vendor" ? "bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-xs" : "text-slate-500"
                  }`}
                >
                  <Truck className="w-3.5 h-3.5" /> Vendors ({summary.totalVendors})
                </button>
              </div>
            </div>
          </div>

          {/* Search and Granular Geographic Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="relative sm:col-span-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, email, phone, city..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div>
              <select
                value={selectedState}
                onChange={(e) => {
                  setSelectedState(e.target.value);
                  setSelectedCity("all");
                  setPage(1);
                }}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">🗺️ All States ({availableStates.length})</option>
                {availableStates.map((s) => (
                  <option key={s.name} value={s.name}>
                    {s.name} ({s.count})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={selectedCity}
                onChange={(e) => {
                  setSelectedCity(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">📍 All Cities ({availableCities.length})</option>
                {availableCities.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name} ({c.count})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* City Quick Pills if state is selected */}
          {selectedState !== "all" && availableCities.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex-shrink-0">
                Cities in {selectedState}:
              </span>
              <button
                onClick={() => setSelectedCity("all")}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedCity === "all"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                All Cities ({availableCities.reduce((acc, c) => acc + c.count, 0)})
              </button>
              {availableCities.map((c) => {
                const isCityActive = selectedCity.toLowerCase() === c.name.toLowerCase();
                return (
                  <button
                    key={c.name}
                    onClick={() => setSelectedCity(isCityActive ? "all" : c.name)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                      isCityActive
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                    }`}
                  >
                    <span>📍 {c.name}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                        isCityActive
                          ? "bg-white/20 text-white"
                          : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {c.count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Region Entities Data Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Entity Name</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Assigned Region</th>
                  <th className="px-4 py-3">Location (City/State)</th>
                  <th className="px-4 py-3">Tax Registration</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {dataLoading ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-12 text-center text-slate-400">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
                      Fetching region records...
                    </td>
                  </tr>
                ) : displayEntities.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-12 text-center text-slate-500">
                      No businesses or vendors found for the selected city and region filter.
                    </td>
                  </tr>
                ) : (
                  displayEntities.map((item) => {
                    const isBusiness = item.entityType === "Business";
                    return (
                      <tr
                        key={`${item.entityType}-${item.id}`}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <td className="px-4 py-3">
                          {isBusiness ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-900">
                              <Building2 className="w-3 h-3" /> Business
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-900">
                              <Truck className="w-3 h-3" /> Vendor
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-bold text-slate-900 dark:text-white text-sm">{item.name}</p>
                          {item.contactPerson && (
                            <p className="text-[11px] text-slate-500 truncate">Contact: {item.contactPerson}</p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                          {item.email && <p>{item.email}</p>}
                          {item.phone && <p className="text-slate-500 text-[11px]">{item.phone}</p>}
                        </td>
                        <td className="px-4 py-3">
                          {item.region && item.region !== "Unassigned" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300">
                              <Globe className="w-3 h-3 text-indigo-500" /> {item.region}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950 dark:text-amber-300">
                              Unassigned
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                          {item.city || item.state ? (
                            <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {[item.city, item.state].filter(Boolean).join(", ")}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">Not set</span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-700 dark:text-slate-300">
                          {item.taxId || <span className="text-slate-400 italic">N/A</span>}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => {
                              setAssignEntity(item);
                              setSelectedAssignRegionId(item.regionId ? String(item.regionId) : "");
                              setIsAssignModalOpen(true);
                            }}
                            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-300 rounded-lg text-xs font-bold transition-all cursor-pointer border border-indigo-200 dark:border-indigo-800"
                          >
                            Assign Region
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500">
                Page {pagination.page} of {pagination.pages} ({pagination.total} records)
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="p-1.5 border border-slate-200 dark:border-slate-800 rounded-lg disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={page >= pagination.pages}
                  onClick={() => setPage((p) => p + 1)}
                  className="p-1.5 border border-slate-200 dark:border-slate-800 rounded-lg disabled:opacity-40 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ASSIGN REGION MODAL */}
      {isAssignModalOpen && assignEntity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-indigo-600" />
                Assign Territory Region
              </h3>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl space-y-1">
              <p className="text-xs text-slate-500 font-medium">Target {assignEntity.entityType}:</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{assignEntity.name}</p>
              {assignEntity.city && (
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Location: {[assignEntity.city, assignEntity.state].filter(Boolean).join(", ")}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Select Region Territory
              </label>
              <select
                value={selectedAssignRegionId}
                onChange={(e) => setSelectedAssignRegionId(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">-- Unassigned --</option>
                {regions.map((reg) => (
                  <option key={reg._id} value={reg._id}>
                    {reg.name} ({reg.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsAssignModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAssignment}
                className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md cursor-pointer"
              >
                Save Region Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
