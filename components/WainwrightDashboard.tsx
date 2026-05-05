"use client";

import { useEffect, useMemo, useState } from "react";
import type { Wainwright } from "@/types/wainwright";
import type { FellProgress } from "@/types/progress";
import type { RoutePoint, SavedRoute, RouteSummary } from "@/types/route";
import type { SortOption, StatusFilter, DashboardView} from "@/types/dashboard";
import DashboardShell from "@/components/dashboard/DashboardShell";
import OverviewView from "@/components/dashboard/OverviewView";
import MapView from "@/components/dashboard/MapView";
import RouteBuilderView from "@/components/dashboard/RouteBuilderView";
import SavedRoutesView from "@/components/dashboard/SavedRoutesView";
import SaveRouteModal from "@/components/dashboard/SaveRouteModal";
import SelectedFellDrawer from "@/components/dashboard/SelectedFellDrawer";


type ProgressState = Record<string, FellProgress>;

function readFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;

  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}


export default function WainwrightDashboard({ fells }: { fells: Wainwright[] }) {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [activeView, setActiveView] = useState<DashboardView>("overview");
  const [search, setSearch] = useState("");
  const [section, setSection] = useState("All");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const [selectedFellId, setSelectedFellId] = useState<string | null>(null);
  const [isRouteMode, setIsRouteMode] = useState(false);
  const [routePoints, setRoutePoints] = useState<RoutePoint[]>([]);
  const [progress, setProgress] = useState<ProgressState>({});
  const [savedRoutes, setSavedRoutes] = useState<SavedRoute[]>([]);

  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [routeName, setRouteName] = useState("");

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setProgress(readFromStorage("wainwright-progress", {}));
      setSavedRoutes(readFromStorage("wainwright-saved-routes-v2", []));
      setHasLoaded(true);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!hasLoaded) return;
    localStorage.setItem("wainwright-progress", JSON.stringify(progress));
  }, [progress, hasLoaded]);

  useEffect(() => {
    if (!hasLoaded) return;
    localStorage.setItem("wainwright-saved-routes-v2", JSON.stringify(savedRoutes));
  }, [savedRoutes, hasLoaded]);

  const plannedFellIds = useMemo(() => {
    return new Set(
      routePoints
        .filter((point) => point.type === "fell" && point.fellId)
        .map((point) => point.fellId as string)
    );
  }, [routePoints]);

  const mergedFells = useMemo(
    () =>
      fells.map((fell) => ({
        ...fell,
        ...progress[fell.id],
        planned: plannedFellIds.has(fell.id),
      })),
    [fells, progress, plannedFellIds]
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


  function updateFell(fellId: string, updates: FellProgress) {
    setProgress((current) => ({
      ...current,
      [fellId]: {
        ...current[fellId],
        ...updates,
      },
    }));
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
        name: routeName.trim(),
        points: routePoints,
      },
    ]);

    setRouteName("");
    setIsSaveModalOpen(false);
  }

  function loadRoute(points: RoutePoint[]) {
    setRoutePoints(points);
    setIsRouteMode(true);
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
      />
    )}

    {activeView === "route" && (
      <RouteBuilderView
        isRouteMode={isRouteMode}
        routePoints={routePoints}
        routeSummary={routeSummary}
        routeDifficulty={routeDifficulty}
        onToggleRouteMode={() => setIsRouteMode((current) => !current)}
        onUndoRoutePoint={undoRoutePoint}
        onClearRoute={clearRoute}
        onOpenSaveModal={() => setIsSaveModalOpen(true)}
        onRemoveRoutePoint={removeRoutePoint}
      />
    )}

    {activeView === "saved" && (
      <SavedRoutesView
        savedRoutes={savedRoutes}
        onLoadRoute={loadRoute}
        onDeleteRoute={deleteRoute}
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

    {selectedFell && (
      <SelectedFellDrawer
        fell={selectedFell}
        onClose={() => setSelectedFellId(null)}
        onToggleCompleted={() => toggleCompleted(selectedFell)}
        onTogglePriority={() =>
          updateFell(selectedFell.id, { priority: !selectedFell.priority })
        }
        onAddToRoute={() =>
          addRoutePoint({
            type: "fell",
            fellId: selectedFell.id,
            lat: selectedFell.latitude,
            lng: selectedFell.longitude,
            name: selectedFell.name,
          })
        }
      />
    )}
  </DashboardShell>
);
}