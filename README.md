# Portfolio Admin Panel

Next.js admin panel for managing portfolio administrators, projects, images, and
stacks.

## Environment

```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api
```

Only expose the public API base URL to the browser. Admin auth uses the Sanctum
token returned by `POST /api/admin/login`.

## Routes

- `/admin_panel/login`
- `/admin_panel/users`
- `/admin_panel/users/new`
- `/admin_panel/users/{id}/edit`
- `/admin_panel/projects`
- `/admin_panel/projects/new`
- `/admin_panel/projects/{id}/edit`

Stacks are created only inside the project create/edit form. Each project owns
its own stacks, and each stack has a name plus a technologies line such as
`react, tailwind, sass, framer-motion`.

## Local Commands

```bash
npm run dev
npm run lint
npm run build
```

The admin panel is responsive: desktop uses a fixed aside, while mobile and
tablet use a collapsible drawer.
