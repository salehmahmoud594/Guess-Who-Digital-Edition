import { createRoot } from "react-dom/client";
import "./index.css";
import "./artwork-fixes.css";

const isGithubPagesBuild = import.meta.env.MODE === "github-pages";

async function startServerBackedApp() {
  const [{ default: App }, { trpc }, { COOKIE_NAME, UNAUTHED_ERR_MSG }, { QueryClient, QueryClientProvider }, { httpBatchLink, TRPCClientError }, superjsonModule, { startLogin }] = await Promise.all([
    import("./App"),
    import("@/lib/trpc"),
    import("@shared/const"),
    import("@tanstack/react-query"),
    import("@trpc/client"),
    import("superjson"),
    import("./const"),
  ]);
  const superjson = superjsonModule.default;
  const queryClient = new QueryClient();
  const redirectToLoginIfUnauthorized = (error: unknown) => {
    if (!(error instanceof TRPCClientError) || typeof window === "undefined" || error.message !== UNAUTHED_ERR_MSG) return;
    startLogin();
  };
  queryClient.getQueryCache().subscribe(event => {
    if (event.type === "updated" && event.action.type === "error") redirectToLoginIfUnauthorized(event.query.state.error);
  });
  queryClient.getMutationCache().subscribe(event => {
    if (event.type === "updated" && event.action.type === "error") redirectToLoginIfUnauthorized(event.mutation.state.error);
  });
  const trpcClient = trpc.createClient({
    links: [httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      headers() {
        try {
          const raw = sessionStorage.getItem("manus-cookie");
          const prefix = `${COOKIE_NAME}=`;
          const token = raw?.split(";").find(s => s.trim().startsWith(prefix))?.trim().slice(prefix.length);
          return token ? { Authorization: `Bearer ${token}` } : {};
        } catch { return {}; }
      },
      fetch(input, init) { return globalThis.fetch(input, { ...(init ?? {}), credentials: "include" }); },
    })],
  });
  createRoot(document.getElementById("root")!).render(<trpc.Provider client={trpcClient} queryClient={queryClient}><QueryClientProvider client={queryClient}><App /></QueryClientProvider></trpc.Provider>);
}

if (isGithubPagesBuild) {
  void import("./App.github-pages").then(({ default: GithubPagesApp }) => {
    createRoot(document.getElementById("root")!).render(<GithubPagesApp />);
  });
} else {
  void startServerBackedApp();
}
