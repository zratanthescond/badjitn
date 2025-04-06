"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Input } from "../ui/input";
import { formUrlQuery, removeKeysFromQuery } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Search as SearchIcon } from "lucide-react";

const Search = ({
  placeholder = "Search title...",
  slim = false,
}: {
  placeholder?: string;
  slim?: boolean;
}) => {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      let newUrl = "";

      if (query) {
        newUrl = formUrlQuery({
          params: searchParams.toString(),
          key: "query",
          value: query,
        });
      } else {
        newUrl = removeKeysFromQuery({
          params: searchParams.toString(),
          keysToRemove: ["query"],
        });
      }

      router.push(newUrl, { scroll: false });
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query, searchParams, router]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={"ghost"}
          className=" min-h-[54px] glass rounded-full md:p-4 md:mx-2"
        >
          <SearchIcon className="md:w-4 md:h-4  " />
          Search
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-full p-1 rounded-full">
        <div className="flex-center  w-full overflow-hidden rounded-full glass bg-card ">
          <Input
            type="text"
            placeholder={placeholder}
            onChange={(e) => setQuery(e.target.value)}
            className="p-regular-16 border-0 w-full  outline-offset-0  focus:border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Search;
