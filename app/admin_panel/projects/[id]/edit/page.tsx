"use client";

import { useParams } from "next/navigation";
import { ProjectEditor } from "@/components/ProjectEditor";

export default function EditProjectPage() {
  const params = useParams<{ id: string }>();

  return <ProjectEditor projectId={params.id} title="Edit project" />;
}
