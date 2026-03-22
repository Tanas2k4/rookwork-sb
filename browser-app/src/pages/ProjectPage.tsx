import { Outlet } from "react-router-dom";
import ProjectHeader from "../project/ProjectHeader";
import ProjectTabs from "../navigation/ProjectTabs";
import { ProjectProvider } from "../project/ProjectProvider";

function ProjectPage() {
  return (
    <ProjectProvider>
      <ProjectHeader />
      <ProjectTabs />
      <div>
        <Outlet />
      </div>
    </ProjectProvider>
  );
}

export default ProjectPage;
