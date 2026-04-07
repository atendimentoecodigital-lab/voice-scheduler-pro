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
import { useTeam } from "@/hooks/useTeam";

export default function Clients() {
  const { clients, loading, usingMock, addClient, updateClient, deleteClient, reload } = useClients();
  const { currentTeam, teams } = useTeam();
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

  const getTeamColor = (slug: string) => teams.find((t) => t.slug === slug)?.color || "#6B7280";

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
            {currentTeam && (
              <span className="ml-2 inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: currentTeam.color }} />
                <span className="text-xs font-medium">{currentTeam.name}</span>
              </span>
            )}
            {usingMock && <span className="ml-2 text-yellow-500 text-xs">(modo demo)</span>}
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
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="em_contato">Em Contato</SelectItem>
            <SelectItem value="agendado">Agendado</SelectItem>
            <SelectItem value="nao_atendeu">Não Atendeu</SelectItem>
            <SelectItem value="recusou">Recusou</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Equipe</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tentativas</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  Nenhum cliente encontrado
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getTeamColor(client.team) }} />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>{client.company}</TableCell>
                  <TableCell>{client.phone}</TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>
                    <StatusBadge status={client.status} />
                  </TableCell>
                  <TableCell>{client.contact_attempts}/{client.max_attempts}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => { setEditingClient(client); setDialogOpen(true); }}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleDelete(client.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ClientDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        client={editingClient ? toDialogClient(editingClient) : undefined}
        onSave={handleSave}
      />
    </div>
  );
}
