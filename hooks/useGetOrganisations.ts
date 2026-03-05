"use client";

import { useState, useEffect } from "react";
import { getOrganisationsByUser } from "@/lib/actions/organisation.actions";

export function useGetOrganisations(userId: string) {
    const [organisations, setOrganisations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchOrganisations() {
            if (!userId) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const orgs = await getOrganisationsByUser(userId);
                setOrganisations(orgs || []);
            } catch (err) {
                setError((err as Error).message);
            } finally {
                setLoading(false);
            }
        }

        fetchOrganisations();
    }, [userId]);

    return { organisations, loading, error, setOrganisations };
}
