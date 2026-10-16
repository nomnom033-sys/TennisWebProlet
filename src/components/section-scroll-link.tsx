"use client";

import {
  type AnchorHTMLAttributes,
  type MouseEvent,
  useEffect,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const STORAGE_KEY = "tennisweb:scroll-target";
const SECTION_IDS = ["booking", "schedule"] as const;

type SectionId = (typeof SECTION_IDS)[number];

type SectionScrollLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  sectionId: SectionId;
};

export function SectionScrollLink({
  sectionId,
  onClick,
  ...props
}: SectionScrollLinkProps) {
  const router = useRouter();

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    if (event.defaultPrevented || isModifiedClick(event)) return;

    event.preventDefault();

    if (window.location.pathname !== "/") {
      storeSectionId(sectionId);
      router.push("/");
      return;
    }

    clearStoredSectionId();
    scrollToSection(sectionId);
  }

  return <Link href="/" onClick={handleClick} {...props} />;
}

export function SectionScrollHandler() {
  useEffect(() => {
    const sectionId = takeStoredSectionId() ?? getLastSectionIdFromHash(
      window.location.hash,
    );

    if (window.location.hash) {
      window.history.replaceState(null, "", "/");
    }

    if (sectionId) {
      window.requestAnimationFrame(() => scrollToSection(sectionId));
    }
  }, []);

  return null;
}

export function getLastSectionIdFromHash(hash: string): SectionId | null {
  const sectionIds = hash
    .split("#")
    .filter((value): value is SectionId =>
      SECTION_IDS.includes(value as SectionId),
    );

  return sectionIds.at(-1) ?? null;
}

function scrollToSection(sectionId: SectionId) {
  window.history.replaceState(null, "", "/");
  document.getElementById(sectionId)?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

function isModifiedClick(event: MouseEvent<HTMLAnchorElement>) {
  return (
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    event.button !== 0
  );
}

function storeSectionId(sectionId: SectionId) {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, sectionId);
  } catch {
    // Navigation still works if browser storage is unavailable.
  }
}

function takeStoredSectionId() {
  try {
    const value = window.sessionStorage.getItem(STORAGE_KEY);
    window.sessionStorage.removeItem(STORAGE_KEY);
    return SECTION_IDS.includes(value as SectionId) ? (value as SectionId) : null;
  } catch {
    return null;
  }
}

function clearStoredSectionId() {
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore unavailable storage.
  }
}
