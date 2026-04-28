import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Upload, RefreshCw, Image, Video, Music, FileText,
  FolderOpen, Search, Trash2, X, Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/api/client';

type MediaFilter = 'all' | 'image' | 'video' | 'audio' | 'document';

interface MediaFile {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio' | 'document';
  mimeType: string;
  size: number;
  url: string;
  createdAt: string;
}

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

const ACCEPT = 'image/*,video/*,audio/*,.pdf,.doc,.docx';

export function MediaBankView() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [stats, setStats] = useState({ totalFiles: 0, totalBytes: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<MediaFilter>('all');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [filesRes, statsRes] = await Promise.all([
        api.get('/api/media', { params: { type: filter === 'all' ? undefined : filter, search: searchQuery || undefined, limit: 200 } }),
        api.get('/api/media/stats'),
      ]);
      setFiles(filesRes.data?.files || []);
      setStats(statsRes.data);
    } catch (err: any) {
      setError('Erro ao carregar arquivos');
    } finally {
      setLoading(false);
    }
  }, [filter, searchQuery]);

  useEffect(() => { load(); }, [load]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/api/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (evt) => {
          if (evt.total) setUploadProgress(Math.round((evt.loaded / evt.total) * 100));
        },
      });

      setFiles(prev => [res.data, ...prev]);
      setStats(prev => ({ ...prev, totalFiles: prev.totalFiles + 1, totalBytes: prev.totalBytes + file.size }));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao fazer upload');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/api/media/${id}`);
      const removed = files.find(f => f.id === id);
      setFiles(prev => prev.filter(f => f.id !== id));
      if (removed) setStats(prev => ({ ...prev, totalFiles: prev.totalFiles - 1, totalBytes: prev.totalBytes - removed.size }));
    } catch {
      setError('Erro ao deletar arquivo');
    }
  };

  const filterTabs = [
    { id: 'all' as MediaFilter, label: 'Todos', icon: FolderOpen },
    { id: 'image' as MediaFilter, label: 'Imagens', icon: Image },
    { id: 'video' as MediaFilter, label: 'Vídeos', icon: Video },
    { id: 'audio' as MediaFilter, label: 'Áudios', icon: Music },
    { id: 'document' as MediaFilter, label: 'Documentos', icon: FileText },
  ];

  const TypeIcon = ({ type }: { type: string }) => {
    if (type === 'image') return <Image className="w-8 h-8 text-blue-400" />;
    if (type === 'video') return <Video className="w-8 h-8 text-purple-400" />;
    if (type === 'audio') return <Music className="w-8 h-8 text-green-400" />;
    return <FileText className="w-8 h-8 text-orange-400" />;
  };

  const filesProgress = (stats.totalFiles / 1000) * 100;
  const spaceProgress = (stats.totalBytes / (10 * 1024 * 1024 * 1024)) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-semibold text-foreground">Banco de Mídia</h2>
          <p className="text-muted-foreground mt-1">Gerencie imagens, vídeos, áudios e documentos do cliente</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
            Atualizar
          </Button>
          <Button
            size="sm"
            className="bg-success hover:bg-success/90"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
            {uploading ? `Enviando ${uploadProgress}%` : 'Upload'}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPT}
            className="hidden"
            onChange={handleUpload}
          />
        </div>
      </div>

      {/* Erro */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 text-sm">
          <X className="w-4 h-4 flex-shrink-0" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Progress do upload */}
      {uploading && (
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Enviando para Cloudinary...</p>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}

      {/* Uso */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Arquivos</span>
              <span className="text-sm text-muted-foreground">{stats.totalFiles} / 1.000</span>
            </div>
            <Progress value={filesProgress} className="h-2" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Espaço</span>
              <span className="text-sm text-muted-foreground">{formatBytes(stats.totalBytes)} / 10.0 GB</span>
            </div>
            <Progress value={spaceProgress} className="h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Busca e filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar mídia..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1 p-1 bg-muted/50 rounded-lg overflow-x-auto">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap",
                filter === tab.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de arquivos */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-medium mb-4">Arquivos ({files.length})</h3>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : files.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                <FolderOpen className="w-10 h-10 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground font-medium mb-1">Nenhuma mídia encontrada</p>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                Faça upload de imagens, vídeos, áudios ou documentos
              </p>
              <Button className="bg-success hover:bg-success/90" onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-4 h-4 mr-2" />
                Fazer Upload
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="group relative aspect-square rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors overflow-hidden"
                >
                  {/* Preview */}
                  {file.type === 'image' ? (
                    <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-2">
                      <TypeIcon type={file.type} />
                      <p className="text-xs text-center text-muted-foreground truncate w-full px-1">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
                    </div>
                  )}

                  {/* Overlay com ações */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                    <p className="text-white text-xs text-center truncate w-full">{file.name}</p>
                    <p className="text-white/70 text-xs">{formatBytes(file.size)}</p>
                    <div className="flex gap-1">
                      <a href={file.url} target="_blank" rel="noreferrer">
                        <Button size="icon" variant="secondary" className="h-7 w-7">
                          <Search className="w-3 h-3" />
                        </Button>
                      </a>
                      <Button
                        size="icon"
                        variant="destructive"
                        className="h-7 w-7"
                        onClick={() => handleDelete(file.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
