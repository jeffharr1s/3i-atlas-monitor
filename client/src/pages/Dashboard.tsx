import { useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, TrendingUp, Globe, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Streamdown } from 'streamdown';

interface Article {
  id: number;
  title: string;
  summary?: string;
  category: string;
  credibilityScore: number;
  publishedAt: Date | null;
  sourceId: number;
}

interface Source {
  id: number;
  name: string;
  sourceType: string;
  country?: string;
  credibilityScore: number;
}

interface AlertItem {
  id: number;
  title: string;
  description?: string;
  severity: string;
  alertType: string;
  createdAt: Date;
}

const CATEGORY_COLORS: Record<string, string> = {
  trajectory: 'bg-blue-100 text-blue-800',
  composition: 'bg-purple-100 text-purple-800',
  activity: 'bg-orange-100 text-orange-800',
  government_statement: 'bg-red-100 text-red-800',
  scientific_discovery: 'bg-green-100 text-green-800',
  speculation: 'bg-yellow-100 text-yellow-800',
  debunking: 'bg-gray-100 text-gray-800',
  international_perspective: 'bg-indigo-100 text-indigo-800',
  timeline_event: 'bg-pink-100 text-pink-800',
  other: 'bg-slate-100 text-slate-800',
};

const SEVERITY_ICONS: Record<string, React.ReactNode> = {
  low: <AlertTriangle className="h-4 w-4 text-yellow-600" />,
  medium: <AlertCircle className="h-4 w-4 text-orange-600" />,
  high: <AlertTriangle className="h-4 w-4 text-red-600" />,
  critical: <AlertCircle className="h-4 w-4 text-red-800" />,
};

function CredibilityBadge({ score }: { score: number }) {
  const percentage = Math.round(score * 100);
  let color = 'bg-red-100 text-red-800';
  
  if (percentage >= 85) {
    color = 'bg-green-100 text-green-800';
  } else if (percentage >= 70) {
    color = 'bg-blue-100 text-blue-800';
  } else if (percentage >= 50) {
    color = 'bg-yellow-100 text-yellow-800';
  }

  return (
    <Badge className={color}>
      {percentage}% credible
    </Badge>
  );
}

function ArticleCard({ article, source }: { article: Article; source?: Source }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-base line-clamp-2">{article.title}</CardTitle>
            {source && (
              <CardDescription className="mt-1">{source.name}</CardDescription>
            )}
          </div>
          <Badge className={CATEGORY_COLORS[article.category] || CATEGORY_COLORS.other}>
            {article.category.replace(/_/g, ' ')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {article.summary && (
          <p className="text-sm text-gray-600 line-clamp-3">{article.summary}</p>
        )}
        <div className="flex items-center justify-between pt-2 border-t">
          <CredibilityBadge score={article.credibilityScore} />
          {article.publishedAt && (
            <span className="text-xs text-gray-500">
              {new Date(article.publishedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function AlertCard({ alert }: { alert: AlertItem }) {
  return (
    <Alert className={`border-l-4 ${
      alert.severity === 'critical' ? 'border-l-red-600 bg-red-50' :
      alert.severity === 'high' ? 'border-l-orange-600 bg-orange-50' :
      alert.severity === 'medium' ? 'border-l-yellow-600 bg-yellow-50' :
      'border-l-blue-600 bg-blue-50'
    }`}>
      <div className="flex items-start gap-3">
        {SEVERITY_ICONS[alert.severity]}
        <div className="flex-1">
          <h4 className="font-semibold text-sm">{alert.title}</h4>
          {alert.description && (
            <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
          )}
          <p className="text-xs text-gray-500 mt-2">
            {new Date(alert.createdAt).toLocaleString()}
          </p>
        </div>
      </div>
    </Alert>
  );
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [sourceMap, setSourceMap] = useState<Record<number, Source>>({});

  // Fetch data
  const latestArticles = trpc.articles.latest.useQuery({ limit: 10 });
  const sources = trpc.sources.active.useQuery();
  const recentAlerts = trpc.alerts.recent.useQuery({ limit: 5 });

  // Build source map for quick lookup
  useEffect(() => {
    if (sources.data) {
      const map: Record<number, Source> = {};
      sources.data.forEach((source: any) => {
        map[source.id] = source;
      });
      setSourceMap(map);
    }
  }, [sources.data]);

  const isLoading = latestArticles.isLoading || sources.isLoading || recentAlerts.isLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">3I ATLAS Monitor</h1>
          <p className="text-lg text-gray-600">Real-time aggregation and analysis of 3I/ATLAS information from global sources</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{sources.data?.length || 0}</div>
              <p className="text-xs text-gray-500 mt-1">monitoring globally</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Latest Articles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{latestArticles.data?.length || 0}</div>
              <p className="text-xs text-gray-500 mt-1">in database</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Recent Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{recentAlerts.data?.length || 0}</div>
              <p className="text-xs text-gray-500 mt-1">significant changes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Avg Credibility</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {latestArticles.data && latestArticles.data.length > 0
                  ? Math.round(
                      (latestArticles.data as any[]).reduce((sum: number, a: any) => sum + a.credibilityScore, 0) /
                        latestArticles.data.length * 100
                    )
                  : 0}%
              </div>
              <p className="text-xs text-gray-500 mt-1">across sources</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="by-category">By Category</TabsTrigger>
            <TabsTrigger value="sources">Sources</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Latest Articles
                </CardTitle>
                <CardDescription>
                  Most recent 3I/ATLAS information from all monitored sources
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8 text-gray-500">Loading articles...</div>
                ) : latestArticles.data && latestArticles.data.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(latestArticles.data as any[]).map((article: Article) => (
                      <ArticleCard
                        key={article.id}
                        article={article}
                        source={sourceMap[article.sourceId]}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">No articles found</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* By Category Tab */}
          <TabsContent value="by-category" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Articles by Category</CardTitle>
                <CardDescription>
                  Filter articles by topic to explore specific aspects of 3I/ATLAS
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.keys(CATEGORY_COLORS).map((category) => (
                    <div key={category} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge className={CATEGORY_COLORS[category]}>
                          {category.replace(/_/g, ' ')}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          {(latestArticles.data as any[])?.filter((a: Article) => a.category === category).length || 0} articles
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sources Tab */}
          <TabsContent value="sources" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Monitored Sources
                </CardTitle>
                <CardDescription>
                  News outlets, space agencies, and research institutions providing 3I/ATLAS information
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8 text-gray-500">Loading sources...</div>
                ) : sources.data && sources.data.length > 0 ? (
                  <div className="space-y-3">
                    {(sources.data as any[]).map((source: Source) => (
                      <div key={source.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">{source.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {source.sourceType.replace(/_/g, ' ')}
                            </Badge>
                            {source.country && (
                              <span className="text-xs text-gray-500">{source.country}</span>
                            )}
                          </div>
                        </div>
                        <CredibilityBadge score={source.credibilityScore} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">No sources found</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Recent Alerts
                </CardTitle>
                <CardDescription>
                  Significant changes and important updates detected
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8 text-gray-500">Loading alerts...</div>
                ) : recentAlerts.data && recentAlerts.data.length > 0 ? (
                  <div className="space-y-3">
                    {(recentAlerts.data as any[]).map((alert: AlertItem) => (
                      <AlertCard key={alert.id} alert={alert} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">No alerts at this time</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Information Panel */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-blue-600" />
              About This Monitor
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-700 space-y-2">
            <p>
              This dashboard aggregates information about 3I/ATLAS from multiple authoritative sources including NASA, ESA, SETI Institute, and peer-reviewed publications.
            </p>
            <p>
              Our AI-powered analysis engine cross-references claims across sources to identify probable truths versus speculation, with credibility scores based on source type and content analysis.
            </p>
            <p>
              Credibility scores reflect the reliability of each source and article based on official space agency status, peer review, and consistency with established scientific findings.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
