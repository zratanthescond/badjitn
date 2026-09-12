"use client";

import { useLayoutEffect } from "react";

/**
 * Applies the `.admin-theme` CSS-variable scope (see app/globals.css) to
 * <body> for as long as this component is mounted.
 *
 * Why <body> and not a wrapper <div>: Radix portals (Dialog, Sheet,
 * DropdownMenu, Select, AlertDialog...) render their content as direct
 * children of <body>, escaping any inner wrapper element. CSS custom
 * properties only cascade through the real DOM tree, so scoping the class
 * to an inner div would leave every popover/dialog/menu outside the theme.
 * Toggling the class on <body> keeps the whole subtree — including
 * portaled content — inside the scope, and the effect's cleanup removes it
 * again when navigating away, so the rest of the app (which uses the
 * default theme) is never affected.
 */
export function AdminThemeScope({ children }: { children: React.ReactNode }) {
  useLayoutEffect(() => {
    document.body.classList.add("admin-theme");
    return () => {
      document.body.classList.remove("admin-theme");
    };
  }, []);

  return <>{children}</>;
}

export default AdminThemeScope;
