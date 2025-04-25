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
      //alert("Country changed to: " + newUrl);
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
      className="rounded-full p-2 glass   justify-center  flex w-[57px] items-center "
    />
  );
}
