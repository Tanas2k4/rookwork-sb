import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import CalendarView from "./user/CalendarView";
import Header from "./components/layout/Header";
import Sidebar from "./components/layout/Sidebar";
import Titlebar from "./components/layout/Titlebar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DashboardPage from "./pages/DashboardPage";
import ProjectPage from "./pages/ProjectPage";

import OverView from "./project/OverView";
import BoardView from "./project/BoardView";
import TimelineView from "./project/TimelineView";
import ListView from "./project/ListView";
import Loading from "./components/common/Loading";
import MyIssuesPage    from "./pages/MyIssuesPage";
import IssueDetailPage from "./pages/IssueDetailPage";
function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [sidebar, setSidebar] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleLoginSuccess = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setLoggedIn(true);
      setIsTransitioning(false);
    }, 3000);
  };

  if (isTransitioning) {
    return <Loading fullScreen />;
  }
  return (
    <DndProvider backend={HTML5Backend}>
      <BrowserRouter>
        <div className="h-screen flex flex-col bg-white overflow-hidden">
          <Titlebar />

          {!loggedIn ? (
            <Routes>
              <Route
                path="/login"
                element={<Login onSuccess={handleLoginSuccess} />}
              />
              <Route path="/register" element={<Register />} />
              <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
          ) : (
            <>
              <Header
                setSidebar={setSidebar}
                onLogout={() => setLoggedIn(false)}
              />

              <div className="flex flex-1 overflow-hidden">
                <Sidebar sidebar={sidebar} setSidebar={setSidebar} />

                <main className="flex-1 overflow-auto bg-gray-50">
                  <Routes>
                    {/* DASHBOARD HOME */}
                    <Route path="/dashboard" element={<DashboardPage />} />

                    {/* PROJECT */}
                    <Route
                      path="/projects/:projectKey"
                      element={<ProjectPage />}
                    >
                      <Route
                        index
                        element={<Navigate to="overview" replace />}
                      />
                      <Route path="overview" element={<OverView />} />
                      <Route path="board" element={<BoardView />} />
                      <Route path="timeline" element={<TimelineView />} />
                      <Route path="list" element={<ListView />} />
                    </Route>

                    {/* CALENDAR */}
                    <Route path="/calendars" element={<CalendarView />} />

                    {/* FALLBACK */}
                    <Route path="*" element={<Navigate to="/dashboard" />} />
                    <Route path="/my-issues"       element={<MyIssuesPage />} />
                    <Route path="/issues/:issueId" element={<IssueDetailPage />} />
                  </Routes>
                </main>
              </div>
            </>
          )}
        </div>
      </BrowserRouter>
    </DndProvider>
  );
}

export default App;
