import { useState, useEffect } from "react";
import { supabase, Client } from "@/lib/supabase";
import { mockClients } from "@/data/mock";

function toClient(row: any): Client {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    company: row.company,
    status: row.status,
    contact_attempts: row.contact_attempts,
    max_attempts: row.max_attempts,
    last_contact_at: row.last_contact_at,
    created_at: row.created_at,
  };
}

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false });

      if (error || !data) throw error;

      if (data.length === 0) {
        await supabase.from("clients").insert(
          mockClients.map((c) => ({
            name: c.name,
            phone: c.phone,
            email: c.email,
            company: c.company,
            status: c.status,
            contact_attempts: c.contactAttempts,
            max_attempts: c.maxAttempts,
            last_contact_at: c.lastContactAt,
          }))
        );
        const { data: seeded } = await supabase
          .from("clients")
          .select("*")
          .order("created_at", { ascending: false });
        setClients((seeded || []).map(toClient));
      } else {
        setClients(data.map(toClient));
      }
      setUsingMock(false);
    } catch {
      setClients(
        mockClients.map((c) => ({
          id: c.id,
          name: c.name,
          phone: c.phone,
          email: c.email,
          company: c.company,
          status: c.status,
          contact_attempts: c.contactAttempts,
          max_attempts: c.maxAttempts,
          last_contact_at: c.lastContactAt,
          created_at: c.createdAt,
        }))
      );
      setUsingMock(true);
    } finally {
      setLoading(false);
    }
  };

  const addClient = async (data: {
    name: string;
    phone: string;
    email: string;
    company: string;
  }) => {
    if (usingMock) {
      const newClient: Client = {
        id: String(Date.now()),
        ...data,
        status: "pendente",
        contact_attempts: 0,
        max_attempts: 3,
        last_contact_at: null,
        created_at: new Date().toISOString(),
      };
      setClients((prev) => [newClient, ...prev]);
      return newClient;
    }
    const { data: inserted, error } = await supabase
      .from("clients")
      .insert({ ...data, status: "pendente", contact_attempts: 0, max_attempts: 3 })
      .select()
      .single();
    if (error) throw error;
    const client = toClient(inserted);
    setClients((prev) => [client, ...prev]);
    return client;
  };

  const updateClient = async (id: string, updates: Partial<Client>) => {
    if (usingMock) {
      setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
      return;
    }
    const { error } = await supabase.from("clients").update(updates).eq("id", id);
    if (error) throw error;
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const deleteClient = async (id: string) => {
    if (usingMock) {
      setClients((prev) => prev.filter((c) => c.id !== id));
      return;
    }
    const { error } = await supabase.from("clients").delete().eq("id", id);
    if (error) throw error;
    setClients((prev) => prev.filter((c) => c.id !== id));
  };

  useEffect(() => { load(); }, []);

  return { clients, loading, usingMock, addClient, updateClient, deleteClient, reload: load };
}