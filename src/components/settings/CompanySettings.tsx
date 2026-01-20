import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, X } from 'lucide-react';
import { api } from '@/api/client';
import { useToast } from '@/hooks/use-toast';

export function CompanySettings() {
  const { tenant, refreshTenant } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    status: 'active',
  });

  useEffect(() => {
    if (tenant) {
      setFormData({
        name: tenant.name || '',
        phone: '', // Phone pode ser adicionado ao schema depois
        status: 'active', // Status pode ser adicionado ao schema depois
      });
    }
  }, [tenant]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await api.patch('/api/tenant/settings', {
        name: formData.name,
        phone: formData.phone,
        status: formData.status,
      });

      toast({
        title: 'Configurações salvas!',
        description: 'As configurações da empresa foram atualizadas com sucesso.',
        variant: 'success',
      });

      // Atualizar dados do tenant
      if (refreshTenant) {
        await refreshTenant();
      }
    } catch (err: any) {
      toast({
        title: 'Erro ao salvar configurações',
        description: err.response?.data?.message || 'Não foi possível salvar as alterações.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações da Empresa</CardTitle>
        <CardDescription>
          Gerencie as configurações gerais da empresa
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nome da Empresa */}
          <div className="space-y-2">
            <Label htmlFor="company-name">
              Nome da Empresa <span className="text-destructive">*</span>
            </Label>
            <Input
              id="company-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nome do escritório"
              required
            />
          </div>

          {/* Telefone */}
          <div className="space-y-2">
            <Label htmlFor="company-phone">Telefone</Label>
            <Input
              id="company-phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+551151941933"
            />
          </div>

          {/* Status da Empresa */}
          <div className="space-y-2">
            <Label htmlFor="company-status">Status da Empresa</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger id="company-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Ativa</SelectItem>
                <SelectItem value="inactive">Inativa</SelectItem>
                <SelectItem value="suspended">Suspensa</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {formData.status === 'active' && 'Empresa ativa - todos os serviços funcionando normalmente'}
              {formData.status === 'inactive' && 'Empresa inativa - serviços temporariamente desabilitados'}
              {formData.status === 'suspended' && 'Empresa suspensa - verifique com o suporte'}
            </p>
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" disabled={isLoading}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Salvando...' : 'Salvar Configurações'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
