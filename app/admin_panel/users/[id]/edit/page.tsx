"use client";

import { useParams } from "next/navigation";
import { UserEditor } from "@/components/UserEditor";

export default function EditUserPage() {
  const params = useParams<{ id: string }>();

  return <UserEditor userId={params.id} title="Edit administrator" />;
}
