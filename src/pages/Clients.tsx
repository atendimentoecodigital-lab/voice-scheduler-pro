import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/clients/StatusBadge";
import { ClientDialog } from "@/components/clients/ClientDialog";
import { Client } from "@/lib/supabase";
import { Plus, Search, Pencil, Trash2, Filter, RefreshCw } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useClients } from "@/hooks/useClients";

export default function Clients() {
  const { clients, loading, usingMock, addClient, updateClient, deleteClient, reload } = useClients();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const filtered = clients.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.company.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "todos" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleSave = async (data: { name: string; phone: string; email: string; company: string }) => {
    try {
      if (editingClient) {
        await updateClient(editingClient.id, data);
        toast.success("Cliente atualizado!");
      } else {
        await addClient(data);
        toast.success("Cliente adicionado!");
      }
      setEditingClient(null);
    } catch {
      toast.error("Erro ao salvar cliente");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteClient(id);
      toast.success("Cliente removido!");
    } catch {
      toast.error("Erro ao remover cliente");
    }
  };

  const toDialogClient = (c: Client) => ({
    id: c.id,
    name: c.name,
    phone: c.phone,
    email: c.email,
    company: c.company,
    status: c.status,
    contactAttempts: c.contact_attempts,
    maxAttempts: c.max_attempts,
    lastContactAt: c.last_contact_at,
    createdAt: c.created_at,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Clientes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {clients.length} clientes cadastrados
            {usingMock && <span className="ml-2 text-warning text-xs">(modo demo)</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-9 w-9" onClick={reload} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button onClick={() => { setEditingClient(null); setDialogOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" /> Novo Cliente
          </Button>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou empresa..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            <SelectItem va