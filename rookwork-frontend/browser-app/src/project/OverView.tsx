import { useState, useEffect } from "react";
import OverallProgress from "./overview/Overallprogress";
import DeadlineTimeline from "./overview/Deadlinetimeline";
import Milestones from "./overview/Milestones";
import TaskSnapshot from "./overview/Tasksnapshot";
import ProjectCard from "./overview/Projectcard";
import RecentActivity from "./overview/Recentactivity";
import WorkloadSection from "./overview/Workloadsection";

export default function Overview() {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-[1400px] mx-auto px-8 py-7 grid grid-cols-3 gap-5">
        {/* Overall Progress */}
        <OverallProgress />

        {/* Deadline Timeline */}
        <DeadlineTimeline />

        {/* Milestones */}
        <Milestones animated={animated} />

        {/* Task Snapshot */}
        <TaskSnapshot />

        {/* Project Card (Comments / Assignment) */}
        <ProjectCard />

        {/* Recent Activity */}
        <RecentActivity />

        {/* Workload */}
        <WorkloadSection animated={animated} />
      </div>
    </div>
  );
}
