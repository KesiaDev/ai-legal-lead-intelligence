import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  RefreshCw, 
  Image, 
  Video, 
  Music, 
  FileText, 
  FolderOpen,
  Search
} from 'lucide-react';
import { cn } from '@/lib/utils';

type MediaFilter = 'all' | 'images' | 'videos' | 'audio' | 'documents';

interface MediaFile {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio' | 'document';
  size: number;
  url?: string;
  createdAt: Date;
}

export function MediaBankView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<MediaFilter>('all');
  const [files] = useState<MediaFile[]>([]);

  const LIMIT_FILES = 1000;
  const LIMIT_SPACE_GB = 10;
  const filesCount = files.length;
  const usedSpaceBytes = files.reduce((acc, f) => acc + f.size, 0);
  const usedSpaceGB = (usedSpaceBytes / (1024 * 1024 * 1024)).toFixed(1);
  const filesProgress = (filesCount / LIMIT_FILES) * 100;
  const spaceProgress = (usedSpaceBytes / (LIMIT_SPACE_GB * 1024 * 1024 * 1024)) * 100;

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filterTabs = [
    { id: 'all' as MediaFilter, label: 'Todos', icon: FolderOpen },
    { id: 'images' as MediaFilter, label: 'Imagens', icon: Image },
    { id: 'videos' as MediaFilter, label: 'Vídeos', icon: Video },
    { id: 'audio' as MediaFilter, label: 'Áudios', icon: Music },
    { id: 'documents' as MediaFilter, label: 'Documentos', icon: FileText },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-semibold text-foreground">
            Banco de Mídia
          </h2>
          <p className="text-muted-foreground mt-1">
            Gerencie imagens, vídeos, áudios e documentos do cliente
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
          <Button size="sm" className="bg-success hover:bg-success/90">
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </Button>
        </div>
      </div>

      {/* Usage Metrics */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Arquivos</span>
              <span className="text-sm text-muted-foreground">
                {filesCount} / {LIMIT_FILES}
              </span>
            </div>
            <Progress value={filesProgress} className="h-2" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Espaço</span>
              <span className="text-sm text-muted-foreground">
                {formatBytes(usedSpaceBytes)} / {LIMIT_SPACE_GB}.0 GB
              </span>
            </div>
            <Progress value={spaceProgress} className="h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
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

      {/* Files List / Empty State */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-medium mb-4">Arquivos ({filesCount})</h3>
          {files.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                <FolderOpen className="w-10 h-10 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground font-medium mb-1">
                Nenhuma mídia encontrada
              </p>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                Faça upload de arquivos para começar a usar o banco de mídia
              </p>
              <Button className="bg-success hover:bg-success/90">
                <Upload className="w-4 h-4 mr-2" />
                Fazer Upload
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="aspect-square rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer flex items-center justify-center overflow-hidden"
                >
                  <FileText className="w-8 h-8 text-muted-foreground" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
