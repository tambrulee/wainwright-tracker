"use client";

import { useEffect, useMemo, useState } from "react";
import type { Wainwright } from "@/types/wainwright";
import type { FellProgress } from "@/types/progress";
import type { RoutePoint, SavedRoute, RouteSummary } from "@/types/route";
import type { SortOption, StatusFilter, DashboardView} from "@/types/dashboard";
import DashboardShell from "@/components/dashboard/DashboardShell";
import OverviewView from "@/components/dashboard/OverviewView";
import MapView from "@/components/dashboard/MapView";
import SaveRouteModal from "@/components/dashboard/SaveRouteModal";
import {
  loadProgressFromSupabase,
  saveFellProgressToSupabase,
} from "@/lib/supabase/progress";
import { createClient } from "@/lib/supabase/client";
import FellPlanner from "@/components/fells/FellPlanner";

type ProgressState = Record<string, FellProgress>;

export default function WainwrightDashboard({ fells }: { fells: Wainwright[] }) {
  const [activeView, setActiveView] = useState<DashboardView>("overview");
  const [search, setSearch] = useState("");
  const [section, setSection] = useState("All");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const [selectedFellId, setSelectedFellId] = useState<string | null>(null);
  const [isRouteMode, setIsRouteMode] = useState(false);
  const [routePoints, setRoutePoints] = useState<RoutePoint[]>([]);
  const [progress, setProgress] = useState<ProgressState>({});
  const [savedRoutes, setSavedRoutes] = useState<SavedRoute[]>(() => {
    if (typeof window === "undefined") return [];

    const saved = localStorage.getItem("wainwright-saved-routes");

    if (!saved) return [];

    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  });

  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [routeName, setRouteName] = useState("");

    useEffect(() => {
    async function loadData() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setProgress({});
        setRoutePoints([]);
        return;
      }

      const remoteProgress = await loadProgressFromSupabase();

      setProgress(remoteProgress);
      setSavedRoutes([]);
    }

    loadData();

    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadData();
    });

    return () => subscription.unsubscribe();
  }, []);


useEffect(() => {
  localStorage.setItem("wainwright-saved-routes", JSON.stringify(savedRoutes));
}, [savedRoutes]);

  

  const plannedFellIds = useMemo(() => {
    const ids = new Set<string>();

    routePoints.forEach((point) => {
      if (point.type === "fell" && point.fellId) {
        ids.add(point.fellId);
      }
    });

    savedRoutes.forEach((route) => {
      route.points.forEach((point) => {
        if (point.type === "fell" && point.fellId) {
          ids.add(point.fellId);
        }
      });
    });

    return ids;
  }, [routePoints, savedRoutes]);

  const mergedFells = useMemo(
    () =>
      fells.map((fell) => {
        const fellProgress = progress[fell.id];

        return {
          ...fell,

          // reset all user-owned state by default
          completed: false,
          completedDate: null,
          priority: false,

          // then apply Supabase progress if it exists
          ...fellProgress,

          // planned is always derived from routes
          planned: Boolean(fellProgress?.plannedDate),
        };
      }),
    [fells, progress]
  );

  const sections = useMemo(
    () => ["All", ...Array.from(new Set(fells.map((fell) => fell.section))).sort()],
    [fells]
  );

  const filteredFells = useMemo(() => {
    return mergedFells
      .filter((fell) => {
        const matchesSearch = fell.name.toLowerCase().includes(search.toLowerCase());
        const matchesSection = section === "All" || fell.section === section;

        const matchesStatus =
          statusFilter === "All" ||
          (statusFilter === "Not completed" && !fell.completed) ||
          (statusFilter === "Completed" && fell.completed) ||
          (statusFilter === "Planned" && fell.planned) ||
          (statusFilter === "Priority" && fell.priority);

        return matchesSearch && matchesSection && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === "height-high") return b.heightM - a.heightM;
        if (sortBy === "height-low") return a.heightM - b.heightM;
        if (sortBy === "section") return a.section.localeCompare(b.section);
        return a.name.localeCompare(b.name);
      });
  }, [mergedFells, search, section, statusFilter, sortBy]);

  const selectedFell = mergedFells.find((fell) => fell.id === selectedFellId);

  const routeFells = routePoints
    .filter((point) => point.type === "fell" && point.fellId)
    .map((point) => mergedFells.find((fell) => fell.id === point.fellId))
    .filter(Boolean) as Wainwright[];

  const routeStats = useMemo(() => {
    return routeFells.reduce(
      (total, fell) => ({
        minutes: total.minutes + (fell.estimatedMinutes ?? 0),
        distanceKm: total.distanceKm + (fell.distanceKm ?? 0),
        ascentM: total.ascentM + (fell.ascentM ?? 0),
        descentM: total.descentM + (fell.descentM ?? 0),
      }),
      { minutes: 0, distanceKm: 0, ascentM: 0, descentM: 0 }
    );
  }, [routeFells]);


  const [routeSummary, setRouteSummary] = useState<RouteSummary | null>(null);

  const routeDifficulty = useMemo(() => {
    const distance = routeSummary?.distanceKm ?? routeStats.distanceKm;
    const ascent = routeSummary?.ascentM ?? routeStats.ascentM;

    if (distance >= 15 || ascent >= 900) return "Big day";
    if (distance >= 9 || ascent >= 500) return "Moderate";
    if (distance > 0) return "Easy";
    return null;
  }, [routeSummary, routeStats]);

  const completedCount = mergedFells.filter((fell) => fell.completed).length;

  const plannedCount = mergedFells.filter(
    (fell) => fell.plannedDate && !fell.completed
  ).length;

  const handleTogglePlanned = async (fellId: string) => {
  const current = progress[fellId];

  const updated = {
    ...current,
    planned: !current?.planned,
  };

  setProgress((prev) => ({
    ...prev,
    [fellId]: updated,
  }));

  await saveFellProgressToSupabase(fellId, updated);
};

const handleToggleCompleted = async (fellId: string) => {
  const current = progress[fellId];

  const updated = {
    ...current,
    completed: !current?.completed,
  };

  setProgress((prev) => ({
    ...prev,
    [fellId]: updated,
  }));

  await saveFellProgressToSupabase(fellId, updated);
};

const handleUpdatePlannedDate = async (fellId: string, plannedDate: string) => {
  const cleanDate = plannedDate || null;
  const current = progress[fellId];

  const updated = {
    ...current,
    planned: Boolean(cleanDate),
    plannedDate: cleanDate,
  };

  setProgress((prev) => ({
    ...prev,
    [fellId]: updated,
  }));

  await saveFellProgressToSupabase(fellId, updated);
};


  function updateFell(fellId: string, updates: FellProgress) {
    setProgress((current) => {
      const nextProgress = {
        ...current,
        [fellId]: {
          ...current[fellId],
          ...updates,
        },
      };

      saveFellProgressToSupabase(fellId, nextProgress[fellId]);

      return nextProgress;
    });
  }

  function toggleCompleted(fell: Wainwright) {
    const isNowCompleted = !fell.completed;

    updateFell(fell.id, {
      completed: isNowCompleted,
      completedDate: isNowCompleted ? new Date().toISOString().slice(0, 10) : null,
    });
  }

  function addRoutePoint(point: Omit<RoutePoint, "id">) {
    setRoutePoints((current) => [
      ...current,
      {
        ...point,
        id: `${point.type}-${point.fellId ?? "custom"}-${Date.now()}-${current.length}`,
      },
    ]);
  }

  function removeRoutePoint(pointId: string) {
    setRoutePoints((current) => current.filter((point) => point.id !== pointId));
  }

  function undoRoutePoint() {
    setRoutePoints((current) => current.slice(0, -1));
  }

  function clearRoute() {
    setRoutePoints([]);
  }

  function saveCurrentRoute() {
    if (!routeName.trim() || routePoints.length < 2) return;

    setSavedRoutes((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        name: routeName.trim(),
        points: routePoints,
      },
    ]);

    setRouteName("");
    setIsSaveModalOpen(false);
  }

  function loadRoute(points: RoutePoint[]) {
    setRoutePoints(points);
    setIsRouteMode(false);
  }

  function deleteRoute(index: number) {
    setSavedRoutes((current) => current.filter((_, i) => i !== index));
  }

  function resetFilters() {
    setSearch("");
    setSection("All");
    setStatusFilter("All");
    setSortBy("name");
  }

  function startNewRouteSession() {
    setRoutePoints([]);
    setIsRouteMode(true);
  }

  function finishRouteSession() {
    setIsRouteMode(false);
  }

  function updateSavedRouteName(routeId: string, name: string) {
    setSavedRoutes((current) =>
      current.map((route) =>
        route.id === routeId ? { ...route, name } : route
      )
    );
  }

  function updateSavedRoutePoints(routeId: string) {
    setSavedRoutes((current) =>
      current.map((route) =>
        route.id === routeId ? { ...route, points: routePoints } : route
      )
    );
  }
    

  return (
  <DashboardShell activeView={activeView} onChangeView={setActiveView}>
    {activeView === "overview" && (
      <OverviewView
        fells={mergedFells}
        onSelectFell={setSelectedFellId}
      />
    )}

    {activeView === "map" && (
      <MapView
        fells={filteredFells}
        sections={sections}
        search={search}
        section={section}
        statusFilter={statusFilter}
        sortBy={sortBy}
        selectedFell={selectedFell}
        isRouteMode={isRouteMode}
        routePoints={routePoints}
        routePointsCount={routePoints.length}
        filteredFellsCount={filteredFells.length}
        savedRoutesCount={savedRoutes.length}
        onSearchChange={setSearch}
        onSectionChange={setSection}
        onStatusFilterChange={setStatusFilter}
        onSortByChange={setSortBy}
        onResetFilters={resetFilters}
        onSelectFell={setSelectedFellId}
        onAddRoutePoint={addRoutePoint}
        onRemoveRoutePoint={removeRoutePoint}
        onRouteSummaryChange={setRouteSummary}
        routeSummary={routeSummary}
        routeDifficulty={routeDifficulty}
        savedRoutes={savedRoutes}
        onStartNewRouteSession={startNewRouteSession}
        onFinishRouteSession={finishRouteSession}
        onUndoRoutePoint={undoRoutePoint}
        onClearRoute={clearRoute}
        onOpenSaveModal={() => setIsSaveModalOpen(true)}
        onLoadRoute={loadRoute}
        onDeleteRoute={deleteRoute}
        onUpdateSavedRouteName={updateSavedRouteName}
        onUpdateSavedRoutePoints={updateSavedRoutePoints}
        onToggleCompleted={toggleCompleted}
        onTogglePriority={(fell) =>
          updateFell(fell.id, { priority: !fell.priority })
        }
        completedFellsCount={completedCount}
        plannedFellsCount={plannedCount}
      />
    )}

    {activeView === "planner" && (
      <FellPlanner
        fells={mergedFells}
        onTogglePlanned={handleTogglePlanned}
        onToggleCompleted={handleToggleCompleted}
        onUpdatePlannedDate={handleUpdatePlannedDate}
      />
    )}

    <SaveRouteModal
      isOpen={isSaveModalOpen}
      routeName={routeName}
      onRouteNameChange={setRouteName}
      onClose={() => {
        setRouteName("");
        setIsSaveModalOpen(false);
      }}
      onSave={saveCurrentRoute}
    />

  </DashboardShell>
);
}