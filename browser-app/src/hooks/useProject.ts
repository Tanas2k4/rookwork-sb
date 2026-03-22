import { useContext } from "react";
import { ProjectContext } from "../context/ProjectContext";
export function useProject() {
  return useContext(ProjectContext);
}
