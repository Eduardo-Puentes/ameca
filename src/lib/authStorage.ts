export const tokenStorage = {
  get: () => {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem("ameca_token");
  },
  set: (token: string) => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("ameca_token", token);
  },
  clear: () => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem("ameca_token");
  },
};
