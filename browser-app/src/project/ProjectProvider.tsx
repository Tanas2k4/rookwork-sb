import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { projectApi } from "../api/services/projectApi";
import type { ProjectResponse } from "../api/contracts";
import { ProjectContext } from "../context/ProjectContext";

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const { projectKey } = useParams<{ projectKey: string }>();
  const [project, setProject] = useState<ProjectResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const reloadIssuesRef = useRef<() => void>(() => {});

  async function load() {
    if (!projectKey) return;
    setLoading(true);
    try {
      const all = await projectApi.getAll();
      const found = all.find(
        (p) => p.id.toLowerCase() === projectKey.toLowerCase(),
      );
      setProject(found ?? null);
      if (!found) console.warn("Project not found for key:", projectKey);
    } catch (err) {
      console.error("Failed to load project", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [projectKey]);

  return (
    <ProjectContext.Provider
      value={{
        projectId: projectKey ?? null,
        projectKey: projectKey ?? null,
        project,
        members: project?.members ?? [],
        loading,
        refresh: load,
        reloadIssues: () => reloadIssuesRef.current(),
        setReloadIssues: (fn) => {
          reloadIssuesRef.current = fn;
        },
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}
