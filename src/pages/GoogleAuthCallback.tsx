import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

export default function GoogleAuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Conectando Google Agenda...");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const error = params.get("error");

    if (error) {
      setStatus("error");
      setMessage("Autorização negada. Tente novamente.");
      setTimeout(() => navigate("/agendamentos"), 3000);
      return;
    }

    if (!code) {
      setStatus("error");
      setMessage("Código de autorização não encontrado.");
      setTimeout(() => navigate("/agendamentos"), 3000);
      return;
    }

    const exchange = async () => {
      try {
        const { data, error: fnError } = await supabase.functions.invoke("google-callback", {
          body: { code },
        });

        if (fnError || data?.error) throw fnError || new Error(data.error);

        setStatus("success");
        setMessage("Google Agenda conectado com sucesso!");
        setTimeout(() => navigate("/agendamentos"), 1500);
      } catch (err: any) {
        setStatus("error");
        setMessage(err.message || "Erro ao conectar. Tente novamente.");
        setTimeout(() => navigate("/agendamentos"), 3000);
      }
    };

    exchange();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4 p-8 rounded-2xl border border-border bg-card max-w-sm w-full">
        {status === "loading" && (
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto" />
        )}
        {status === "success" && (
          <div className="w-12 h-12 rounded-full bg-success/15 flex items-center justify-center mx-auto">
            <svg className="w-6 h-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
        {status === "error" && (
          <div className="w-12 h-12 rounded-full bg-destructive/15 flex items-center justify-center mx-auto">
            <svg className="w-6 h-6 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        )}
        <p className="text-sm font-medium text-foreground">{message}</p>
        <p className="text-xs text-muted-foreground">Redirecionando em instantes...</p>
      </div>
    </div>
  );
}