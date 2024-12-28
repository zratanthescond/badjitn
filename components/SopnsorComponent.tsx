"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { differenceInDays, parseISO, isValid } from "date-fns";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { createSponsorAction } from "@/lib/actions/event.actions";

export default function SponsorComponent({ eventId }: { eventId: string }) {
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [totalCost, setTotalCost] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const costPerDay = 0.5; // Example base cost per day

  const calculateCost = () => {
    if (fromDate && toDate) {
      const start = parseISO(fromDate);
      const end = parseISO(toDate);

      if (!isValid(start) || !isValid(end)) {
        setErrorMessage("Please enter valid dates.");
        return 0;
      }

      const days = differenceInDays(end, start) + 1;
      if (days <= 0) {
        setErrorMessage('The "To Date" must be after the "From Date".');
        return 0;
      }

      setErrorMessage(null);
      return days * costPerDay;
    }
    return 0;
  };
  useEffect(() => {
    setTotalCost(calculateCost());
  }, [toDate]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const calculatedCost = calculateCost();
    if (calculatedCost > 0) {
      const sponsor = await createSponsorAction({
        eventId: eventId,
        costPerDay: costPerDay,
        fromDate: fromDate,
        toDate: toDate,
      });
      sponsor.success
        ? setSuccessMessage(sponsor.message)
        : setErrorMessage(sponsor.message);
    } else {
      setSuccessMessage(null);
    }
  };

  return (
    <Card className="flex w-full glass flex-col">
      <CardHeader>
        <CardTitle className="text-white">Sponsor Your Event</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="fromDate" className="text-white">
              From Date
            </Label>
            <Input
              id="fromDate"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              min={new Date().toISOString()}
              className="mt-2 glass flex w-full text-white"
            />
          </div>
          <div>
            <Label htmlFor="toDate" className="text-white">
              To Date
            </Label>
            <Input
              id="toDate"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              min={fromDate}
              className="mt-2 flex glass w-full text-white"
            />
          </div>
          {errorMessage && <p className="text-red-600">{errorMessage}</p>}
          {successMessage && <p className="text-green-600">{successMessage}</p>}
          <div>
            <p className="text-white">
              Total Cost: <strong>${totalCost}</strong>
            </p>
          </div>
          <Button type="submit" className="w-full  glass">
            Sponsor Event
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
