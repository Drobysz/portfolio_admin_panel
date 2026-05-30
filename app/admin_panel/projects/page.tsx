"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/AdminShell";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { apiFetch, ApiCollection, Project, validationSummary } from "@/lib/api";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  const [deleteProject, setDeleteProject] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    void loadProjects();
  }, []);

  async function loadProjects() {
    setLoading(true);
    setErrors([]);

    try {
      const projectResponse = await apiFetch<ApiCollection<Project>>(
        "/admin/projects",
      );
      setProjects(projectResponse.data);
    } catch (error) {
      setErrors(validationSummary(error));
    } finally {
      setLoading(false);
    }
  }

  async function destroyProject() {
    if (!deleteProject) return;
    setDeleting(true);
    setErrors([]);
    setNotice("");

    try {
      await apiFetch(`/admin/projects/${deleteProject.id}`, { method: "DELETE" });
      setDeleteProject(null);
      setNotice("Project deleted.");
      await loadProjects();
    } catch (error) {
      setErrors(validationSummary(error));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <AdminShell>
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-sky-700">
              Projects
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Portfolio content
            </h1>
          </div>
          <Link
            href="/admin_panel/projects/new"
            className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            New portfolio
          </Link>
        </div>

        {(errors.length > 0 || notice) && (
          <div
            className={`mt-6 rounded-md border px-4 py-3 text-sm ${
              errors.length
                ? "border-rose-200 bg-rose-50 text-rose-800"
                : "border-emerald-200 bg-emerald-50 text-emerald-800"
            }`}
          >
            {errors.length ? errors.map((error) => <p key={error}>{error}</p>) : notice}
          </div>
        )}

        <div className="mt-8 overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-base font-semibold">Project list</h2>
          </div>
          {loading ? (
            <p className="p-5 text-sm text-slate-500">Loading projects</p>
          ) : projects.length === 0 ? (
            <p className="p-5 text-sm text-slate-500">No projects yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
                  <tr>
                    <th className="px-5 py-3">Project</th>
                    <th className="px-5 py-3">Tag</th>
                    <th className="px-5 py-3">Stacks</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Order</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {projects.map((project) => (
                    <tr key={project.id}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {project.cover_image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={project.cover_image_url}
                              alt=""
                              className="h-14 w-20 rounded-md object-cover"
                            />
                          ) : (
                            <div className="h-14 w-20 rounded-md bg-slate-200" />
                          )}
                          <div className="min-w-0">
                            <p className="truncate font-semibold">{project.title}</p>
                            <p className="truncate text-xs text-slate-500">
                              {project.slug}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {project.tag || "None"}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {project.stacks?.map((stack) => stack.name).join(", ") || "None"}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            project.is_published
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {project.is_published ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {project.sort_order}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/admin_panel/projects/${project.id}/edit`}
                            className="rounded-md border border-slate-300 px-3 py-2 font-medium hover:bg-slate-50"
                          >
                            Edit
                          </Link>
                          <button
                            type="button"
                            className="rounded-md border border-rose-200 px-3 py-2 font-medium text-rose-700 hover:bg-rose-50"
                            onClick={() => setDeleteProject(project)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {deleteProject && (
        <ConfirmDialog
          title="Delete project"
          message={`Delete ${deleteProject.title}? Stored images will also be removed when the storage policy allows it.`}
          confirming={deleting}
          onCancel={() => setDeleteProject(null)}
          onConfirm={destroyProject}
        />
      )}
    </AdminShell>
  );
}
