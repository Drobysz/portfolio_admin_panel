"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/AdminShell";
import { ImageUploadField } from "@/components/ImageUploadField";
import { apiFetch, ApiResource, Project, Stack, validationSummary } from "@/lib/api";

type ProjectForm = {
  title: string;
  slug: string;
  period: string;
  tag: string;
  short_description: string;
  description: string;
  project_url: string;
  repository_url: string;
  sort_order: string;
  is_published: boolean;
  cover_image_url?: string | null;
  cover_image_path?: string | null;
  project_image_url?: string | null;
  project_image_path?: string | null;
};

type StackDraft = {
  id: string;
  name: string;
  technologies: string;
};

const emptyProjectForm: ProjectForm = {
  title: "",
  slug: "",
  period: "",
  tag: "",
  short_description: "",
  description: "",
  project_url: "",
  repository_url: "",
  sort_order: "0",
  is_published: false,
};

function createStackDraft(stack?: Stack): StackDraft {
  return {
    id: stack ? String(stack.id) : crypto.randomUUID(),
    name: stack?.name ?? "",
    technologies: stack?.technologies ?? "",
  };
}

export function ProjectEditor({
  projectId,
  title,
}: {
  projectId?: string;
  title: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState<ProjectForm>(emptyProjectForm);
  const [stacks, setStacks] = useState<StackDraft[]>([createStackDraft()]);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [projectFile, setProjectFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(Boolean(projectId));
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const editing = Boolean(projectId);

  useEffect(() => {
    if (!projectId) return;

    async function loadProject() {
      setLoading(true);
      setErrors([]);

      try {
        const projectResponse = await apiFetch<ApiResource<Project>>(
          `/admin/projects/${projectId}`,
        );
        const project = projectResponse.data;
        setForm({
          title: project.title,
          slug: project.slug,
          period: project.period ?? "",
          tag: project.tag ?? "",
          short_description: project.short_description ?? "",
          description: project.description ?? "",
          project_url: project.project_url ?? "",
          repository_url: project.repository_url ?? "",
          sort_order: String(project.sort_order ?? 0),
          is_published: project.is_published,
          cover_image_path: project.cover_image_path,
          cover_image_url: project.cover_image_url,
          project_image_path: project.project_image_path,
          project_image_url: project.project_image_url,
        });
        setStacks(
          project.stacks.length
            ? project.stacks.map((stack) => createStackDraft(stack))
            : [createStackDraft()],
        );
      } catch (error) {
        setErrors(validationSummary(error));
      } finally {
        setLoading(false);
      }
    }

    void loadProject();
  }, [projectId]);

  function updateStack(id: string, patch: Partial<StackDraft>) {
    setStacks((current) =>
      current.map((stack) => (stack.id === id ? { ...stack, ...patch } : stack)),
    );
  }

  function removeStack(id: string) {
    setStacks((current) =>
      current.length === 1 ? [createStackDraft()] : current.filter((stack) => stack.id !== id),
    );
  }

  async function saveProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setErrors([]);

    const body = new FormData();
    body.set("title", form.title);
    body.set("slug", form.slug);
    body.set("period", form.period);
    body.set("tag", form.tag);
    body.set("short_description", form.short_description);
    body.set("description", form.description);
    body.set("project_url", form.project_url);
    body.set("repository_url", form.repository_url);
    body.set("sort_order", form.sort_order || "0");
    body.set("is_published", form.is_published ? "1" : "0");
    body.set(
      "stacks",
      JSON.stringify(
        stacks
          .filter((stack) => stack.name.trim())
          .map((stack) => ({
            name: stack.name,
            technologies: stack.technologies,
          })),
      ),
    );

    if (coverFile) body.set("cover", coverFile);
    if (projectFile) body.set("project", projectFile);

    try {
      await apiFetch<ApiResource<Project>>(
        editing ? `/admin/projects/${projectId}` : "/admin/projects",
        {
          method: "POST",
          body,
        },
      );
      router.push("/admin_panel/projects");
    } catch (error) {
      setErrors(validationSummary(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminShell>
      <div className="mx-auto max-w-5xl">
        <button
          type="button"
          onClick={() => router.push("/admin_panel/projects")}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50"
        >
          Back to projects
        </button>
        <div className="mt-8">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-sky-700">
            Projects
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h1>
        </div>

        {errors.length > 0 && (
          <div className="mt-6 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {errors.map((error) => (
              <p key={error}>{error}</p>
            ))}
          </div>
        )}

        {loading ? (
          <p className="mt-8 rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-500">
            Loading project form
          </p>
        ) : (
          <form
            onSubmit={saveProject}
            className="mt-8 rounded-lg border border-slate-200 bg-white p-6"
          >
            <div className="grid gap-5 md:grid-cols-2">
              <label className="block text-sm font-medium md:col-span-2">
                Title
                <input
                  className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
                  value={form.title}
                  onChange={(event) => setForm({ ...form, title: event.target.value })}
                  required
                />
              </label>
              <label className="block text-sm font-medium">
                Slug
                <input
                  className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
                  value={form.slug}
                  onChange={(event) => setForm({ ...form, slug: event.target.value })}
                  placeholder="auto-generated"
                />
              </label>
              <label className="block text-sm font-medium">
                Period
                <input
                  className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
                  value={form.period}
                  onChange={(event) =>
                    setForm({ ...form, period: event.target.value })
                  }
                  placeholder="2026"
                />
              </label>
              <label className="block text-sm font-medium">
                Tag
                <input
                  className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
                  value={form.tag}
                  onChange={(event) => setForm({ ...form, tag: event.target.value })}
                  placeholder="pet-project, game, soon"
                />
              </label>
              <label className="block text-sm font-medium md:col-span-2">
                Short description
                <textarea
                  className="mt-2 min-h-24 w-full rounded-md border border-slate-300 px-3 py-2"
                  value={form.short_description}
                  onChange={(event) =>
                    setForm({ ...form, short_description: event.target.value })
                  }
                />
              </label>
              <label className="block text-sm font-medium md:col-span-2">
                Description
                <textarea
                  className="mt-2 min-h-36 w-full rounded-md border border-slate-300 px-3 py-2"
                  value={form.description}
                  onChange={(event) =>
                    setForm({ ...form, description: event.target.value })
                  }
                />
              </label>
              <label className="block text-sm font-medium">
                Site URL
                <input
                  className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
                  type="url"
                  value={form.project_url}
                  onChange={(event) =>
                    setForm({ ...form, project_url: event.target.value })
                  }
                />
              </label>
              <label className="block text-sm font-medium">
                Repository URL
                <input
                  className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
                  type="url"
                  value={form.repository_url}
                  onChange={(event) =>
                    setForm({ ...form, repository_url: event.target.value })
                  }
                />
              </label>
              <label className="block text-sm font-medium">
                Sort order
                <input
                  className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
                  type="number"
                  value={form.sort_order}
                  onChange={(event) =>
                    setForm({ ...form, sort_order: event.target.value })
                  }
                />
              </label>
              <label className="flex items-center gap-3 self-end rounded-md border border-slate-300 px-3 py-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={form.is_published}
                  onChange={(event) =>
                    setForm({ ...form, is_published: event.target.checked })
                  }
                />
                Published
              </label>
            </div>

            <section className="mt-8 rounded-lg border border-slate-200 p-5">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-base font-semibold">Stacks</h2>
                <button
                  type="button"
                  onClick={() => setStacks([...stacks, createStackDraft()])}
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-50"
                >
                  Add stack
                </button>
              </div>
              <div className="mt-4 grid gap-4">
                {stacks.map((stack, index) => (
                  <div
                    key={stack.id}
                    className="grid gap-3 rounded-md border border-slate-200 p-4 md:grid-cols-[220px_1fr_auto]"
                  >
                    <label className="block text-sm font-medium">
                      Name
                      <input
                        className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
                        value={stack.name}
                        onChange={(event) =>
                          updateStack(stack.id, { name: event.target.value })
                        }
                        placeholder={index === 0 ? "front-end" : "back-end"}
                      />
                    </label>
                    <label className="block text-sm font-medium">
                      Technologies
                      <input
                        className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
                        value={stack.technologies}
                        onChange={(event) =>
                          updateStack(stack.id, {
                            technologies: event.target.value,
                          })
                        }
                        placeholder="react, tailwind, sass, framer-motion"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => removeStack(stack.id)}
                      className="self-end rounded-md border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <div className="mt-8 grid gap-5 md:grid-cols-2">
              <ImageUploadField
                id="cover"
                label="Cover image"
                currentUrl={form.cover_image_url}
                currentPath={form.cover_image_path}
                onChange={setCoverFile}
              />
              <ImageUploadField
                id="project"
                label="Project image"
                currentUrl={form.project_image_url}
                currentPath={form.project_image_path}
                onChange={setProjectFile}
              />
            </div>

            <div className="mt-8 flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-md bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-60"
              >
                {saving ? "Saving" : editing ? "Update project" : "Create project"}
              </button>
              <button
                type="button"
                onClick={() => router.push("/admin_panel/projects")}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </AdminShell>
  );
}
