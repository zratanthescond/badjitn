"use client";

import React, { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Input } from "@/components/ui/input"; // ShadCN Input
import { Button } from "@/components/ui/button"; // ShadCN Button
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"; // ShadCN Select
import { Label } from "@/components/ui/label"; // ShadCN Label
import { Event } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Checkbox } from "./ui/checkbox";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";

interface User {
  _id: string;
  firstName: string;
  email: string;
}

interface ContributorProps {
  event: Event; // The ID of the event
}

const fetchContributors = async (query: string) => {
  const response = await axios.get("/api/contrebuters", { params: { query } });
  return response.data;
};

const ContributorSelection: React.FC<ContributorProps> = ({ event }) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedContributor, setSelectedContributor] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const [contributors, setContributors] = useState([]);

  // Fetch contributors based on search query
  const { data, isFetching } = useQuery({
    queryKey: ["contributors", searchQuery],
    queryFn: () => fetchContributors(searchQuery),
    enabled: !!searchQuery, // Only fetch when there's a search query
  });
  // Mutation to host a contributor
  const mutationFn = (contributorId: string) =>
    axios.post("/api/hostcontributor", { event, contributorId });

  const mutation = useMutation({
    mutationFn: () => mutationFn(selectedContributor),
    onSuccess: (data) => {
      setMessage("Contributor successfully hosted for free!");
      setSelectedContributor("");
    },
    onError: () => {
      setMessage("An error occurred while hosting the contributor.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedContributor) {
      setMessage("Please select a contributor.");
      return;
    }

    mutation.mutate();
  };
  useEffect(() => {
    if (data && data.contributors) {
      setContributors(data.contributors);
    }
  }, [data]);
  useEffect(() => {
    console.log(selectedContributor);
  }, [selectedContributor]);
  return (
    <div className="w-full p-6 shadow-md rounded-md">
      {event.pricePlan && event.pricePlan.length > 0 && (
        <Card className="glass w-full flex flex-col">
          <CardHeader>
            <CardTitle>Choose a plan</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col w-full gap-2">
            {event.pricePlan.map((plan) => (
              <div className="flex glass p-2 rounded-lg flex-row w-full items-center justify-between">
                <span>{plan.name}</span>
                <Badge>{plan.price}</Badge>
                <Checkbox />
              </div>
            ))}
          </CardContent>
        </Card>
      )}
      <h2 className="text-xl font-semibold mb-4">Host a Contributor</h2>
      <div className="mb-4">
        <Label htmlFor="search" className="mb-2">
          Search Contributors
        </Label>
        <Input
          id="search"
          type="text"
          placeholder="Search by name or email"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      {isFetching && (
        <p className="text-sm text-gray-500">Loading contributors...</p>
      )}
      <div className="mb-4">
        <Label>Select Contributor</Label>
        <Select
          onValueChange={(value) => setSelectedContributor(value)}
          value={selectedContributor}
        >
          <SelectTrigger className="w-full">
            {selectedContributor
              ? contributors.find((c: User) => c._id === selectedContributor)
                  ?.firstName || "Select a Contributor"
              : "Select a Contributor"}
          </SelectTrigger>
          <SelectContent>
            {contributors.map((contributor: User) => (
              <SelectItem key={contributor._id} value={contributor._id}>
                {contributor.firstName} ({contributor.email})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button
        onClick={handleSubmit}
        className="w-full bg-indigo-600"
        disabled={mutation.isPending}
      >
        {mutation.isPending ? "Hosting..." : "Host Contributor"}
      </Button>
      {message && (
        <p className="mt-4 text-center text-sm text-gray-700">{message}</p>
      )}{" "}
    </div>
  );
};

export default ContributorSelection;
