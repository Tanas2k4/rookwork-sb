import { Outlet } from "react-router-dom";

import ProjectHeader from "../project/ProjectHeader";
import ProjectTabs from "../navigation/ProjectTabs";

function ProjectPage() {
  return (
    <>
      <ProjectHeader />
      <ProjectTabs />

      {/* TAB CONTENT */}
      <div>
        <Outlet />
      </div>
    </>
  );
}

export default ProjectPage;
