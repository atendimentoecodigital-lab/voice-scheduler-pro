import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { mockAppointments, mockAvailability } from "@/data/mock";

export type AppointmentItem = {
  id: string;
  clientId: string;
  clientName: string;
  date: string;
  time: string;
  meetLink: string;
  status: "confirmado" | "pendente" | "cancelado" | "realizado";
  createdAt: string;
};

export type SlotItem = { time: string; available: boolean };
export type DayAvailabilityItem = { date: string; dayName: string; slots: SlotItem[] };

export function useAppointments() {
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [availability, setAvailability] = useState<DayAvailabilityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [usingMock, setUsingMock] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [aptsRes, availRes] = await Promise.all([
        supabase.functions.invoke("calendar-get-appointments"),
        supabase.functions.invoke("calendar-get-availability"),
      ]);

      if (aptsRes.error) throw aptsRes.error;

      const aptsData = aptsRes.data;
      const availData = availRes.data;

      setAppointments(aptsData?.appointments || []);
      setAvailability(availData?.availability || mockAvailability);
      setConnected(aptsData?.connected ?? false);
      setUsingMock(false);
    } catch {
      setAppointments(mockAppointments);
      setAvailability(mockAvailability);
      setUsingMock(true);
      setConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const createAppointment = async (params: {
    clientId?: string;
    clientName: string;
    date: string;
    time: string;
    attendeeEmail?: string;
    description?: string;
    team?: string;
  }) => {
    const { data, error } = await supabase.functions.invoke("calendar-create-event", {
      body: {
        title: `Reunião — ${params.clientName}`,
        description: params.description || `Reunião de alinhamento com ${params.clientName}`,
        date: params.date,
        time: params.time,
        attendeeEmail: params.attendeeEmail,
        clientId: params.clientId,
        team: params.team,
      },
    });
    if (error) throw error;
    await load();
    return data;
  };

  const connectGoogle = async () => {
    const { data, error } = await supabase.functions.invoke("google-auth");
    if (error) throw error;
    if (data?.url) window.location.href = data.url;
  };

  useEffect(() => { load(); }, []);

  return {
    appointments,
    availability,
    loading,
    connected,
    usingMock,
    load,
    createAppointment,
    connectGoogle,
  };
}