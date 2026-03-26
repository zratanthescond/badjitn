"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getOrganisationsByUser } from "@/lib/actions/organisation.actions";
import { useEffect, useState } from "react";
import { IOrganisation } from "@/lib/database/models/organisation.model";

import { CheckCircle2, AlertCircle } from "lucide-react";

type OrganisationDropdownProps = {
  value?: string;
  onChangeHandler?: (value: string) => void;
  userId: string;
};

const OrganisationDropdown = ({ value, onChangeHandler, userId }: OrganisationDropdownProps) => {
  const [organisations, setOrganisations] = useState<IOrganisation[]>([]);

  useEffect(() => {
    const fetchOrganisations = async () => {
      const orgList = await getOrganisationsByUser(userId);
      setOrganisations(orgList || []);
    };

    fetchOrganisations();
  }, [userId]);

  return (
    <Select onValueChange={onChangeHandler} defaultValue={value} value={value}>
      <SelectTrigger className="select-field glass">
        <SelectValue placeholder="Select Organisation" />
      </SelectTrigger>
      <SelectContent className="glass backdrop-blur-xl border-foreground/10">
        {organisations.length > 0 ? (
          organisations.map((org) => (
            <SelectItem
              key={org._id}
              value={org._id}
              className={`select-item p-regular-14 cursor-pointer focus:bg-pink-500/20 ${!org.isVerified ? "opacity-70" : ""}`}
            >
              <div className="flex items-center justify-between w-full gap-2">
                <div className="flex items-center gap-2">
                  {org.logo ? (
                    <img src={org.logo} alt={org.name} className="w-5 h-5 rounded-full object-cover" />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                      <AlertCircle className="w-3 h-3 text-muted-foreground mr-0" />
                    </div>
                  )}
                  <span>{org.name}</span>
                </div>
                {org.isVerified ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500 ml-2 group-focus:text-white" />
                ) : (
                  <div className="flex items-center gap-1 ml-2 bg-yellow-500/10 px-2 py-0.5 rounded-full border border-yellow-500/20">
                    <AlertCircle className="w-3 h-3 text-yellow-500" />
                    <span className="text-[9px] font-bold text-yellow-600 uppercase tracking-tighter">Pending</span>
                  </div>
                )}
              </div>
            </SelectItem>
          ))
        ) : (
          <SelectItem value="none" disabled className="select-item p-regular-14">
            No organisations found
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  );
};

export default OrganisationDropdown;
