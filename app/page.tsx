"use client";
// app/page.tsx
import { useState } from "react";
import MainPage from "@/components/MainPage";
import ProjectPage from "@/components/ProjectPage";
import Project2Page from "@/components/Project2Page";
import AiBot from "@/components/AiBot";

export type PageName = "main" | "project" | "project2";

export default function Home() {
  const [currentPage, setCurrentPage] = useState<PageName>("main");

  const navigate = (page: PageName) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      {currentPage === "main" && <MainPage navigate={navigate} />}
      {currentPage === "project" && <ProjectPage navigate={navigate} />}
      {currentPage === "project2" && <Project2Page navigate={navigate} />}

      {/* AI Bot always visible */}
      <AiBot navigate={navigate} currentPage={currentPage} />
    </>
  );
}
