"use client";
import { useEffect, useState } from "react";
import { CountryDropdown } from "../ui/country-dropdown";
import { useRouter, useSearchParams } from "next/navigation";
import { formUrlQuery, removeKeysFromQuery } from "@/lib/utils";

export default function CountryFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [country, setCountry] = useState<string>(
    searchParams?.get("country") || ""
  );

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const currentCountry = searchParams.get("country") || "";
      if (country === currentCountry) return; // Only push if changed

      let newUrl = "";

      if (country) {
        newUrl = formUrlQuery({
          params: searchParams.toString(),
          key: "country",
          value: country,
        });
      } else {
        newUrl = removeKeysFromQuery({
          params: searchParams.toString(),
          keysToRemove: ["country"],
        });
      }

      router.push(newUrl, { scroll: false });
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [country, searchParams, router]);

  return (
    <CountryDropdown
      onChange={(value) => {
        setCountry(value.alpha3);
      }}
      slim
      defaultValue={country}
      className="h-10 w-12 glass-control border-white/10 rounded-xl flex items-center justify-center transition-all duration-300 hover:shadow-elite-glow hover:scale-110 active:scale-95"
    />
  );
}
