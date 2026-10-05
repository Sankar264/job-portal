import { useEffect, useState } from "react";
import { getResume } from "../services/resumeService";
import { detectSkills } from "./resumeAnalysis";

// null = no resume (or not a seeker); otherwise array of detected skills
export function useResumeSkills(user) {
  const [skills, setSkills] = useState(null);
  useEffect(() => {
    if (user?.role !== "seeker") return;
    getResume(user.id).then((r) => setSkills(r ? detectSkills(r.text) : null)).catch(() => {});
  }, [user?.id]);
  return skills;
}
