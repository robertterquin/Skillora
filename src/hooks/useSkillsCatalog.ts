"use client";

import { useState, useEffect, useMemo } from "react";
import { Skill } from "@/types/database";
import { INITIAL_SKILLS } from "@/lib/catalog-data";
import { createClient } from "@/lib/supabase";
import { skillsService } from "@/services/skillsService";

export function useSkillsCatalog() {
  const [skills, setSkills] = useState<Skill[]>(INITIAL_SKILLS);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    skillsService.fetchLiveSkills(supabase).then((liveSkills) => {
      if (mounted) {
        setSkills(liveSkills);
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  const filteredSkills = useMemo(() => {
    return skills.filter((skill) => {
      const matchesCategory =
        selectedCategory === "all" || skill.category_id === selectedCategory;

      const matchesSearch =
        searchQuery.trim() === "" ||
        skill.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        skill.summary.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [skills, selectedCategory, searchQuery]);

  return {
    skills,
    filteredSkills,
    isLoading,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    setSkills,
  };
}
