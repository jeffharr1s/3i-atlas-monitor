import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, TrendingUp, Globe, CheckCircle2, AlertTriangle, Settings } from 'lucide-react';
import { Streamdown } from 'streamdown';
import { useLocation } from 'wouter';
import NotificationCenter from '@/components/NotificationCenter';

interface Article {
  id: number;
  title: string;
  summary?: string;
  category: string;
  credibilityScore: string | number | null;
  publishedAt: Date | null;
  sourceId: number;
}

interface Source {
  id: number;
  name: string;
  sourceType: string;
  country?: string;
  credibilityScore: string | number | null;
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
  low: <AlertCircle className="h-4 w-4 text-blue-600" />,
  medium: <AlertTriangle className="h-4 w-4 text-yellow-600" />,
  high: <AlertTriangle className="h-4 w-4 text-orange-600" />,
  critical: <AlertCircle className="h-4 w-4 text-red-600" />,
};

const CREDIBILITY_COLORS: Record<number, string> = {
  0: 'text-red-600',
  1: 'text-orange-600',
  2: 'text-yellow-600',
  3: 'text-blue-600',
  4: 'text-green-600',
};

function getCredibilityColor(score: number): string {
  if (score >= 0.85) return 'text-green-600';
  if (score >= 0.7) return 'text-blue-600';
  if (score >= 0.5) return 'text-yellow-600';
  if (score >= 0.3) return 'text-orange-600';
  return 'text-red-600';
}

export default function Dashboard() {
  const [, setLocation] = useLocation();

  const articlesQuery = trpc.articles.latest.useQuery({ limit: 20 });
  const sourcesQuery = trpc.sources.active.useQuery();
  const alertsQuery = trpc.alerts.recent.useQuery({ limit: 10 });

  const articles = (articlesQuery.data as Article[]) || [];
  const sources = (sourcesQuery.data as Source[]) || [];
  const alerts = (alertsQuery.data as AlertItem[]) || [];

  const avgCredibility = articles.length > 0
    ? Math.round((articles.reduce((sum, a) => sum + (typeof a.credibilityScore === 'string' ? parseFloat(a.credibilityScore) : a.credibilityScore || 0), 0) / articles.length) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">3I ATLAS Monitor</h1>
            <p className="text-gray-600 text-sm">Real-time aggregation and analysis of 3I/ATLAS information from global sources</p>
          </div>
          <div className="flex items-center gap-2">
            <NotificationCenter />
            <Button
              variant="outline"
              size="icon"
              onClick={() => setLocation('/notification-settings')}
              title="Notification Settings"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Active Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{sources.length}</div>
              <p className="text-xs text-gray-600 mt-1">monitoring globally</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Latest Articles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{articles.length}</div>
              <p className="text-xs text-gray-600 mt-1">in database</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Recent Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{alerts.length}</div>
              <p className="text-xs text-gray-600 mt-1">significant changes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Avg Credibility</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${getCredibilityColor(avgCredibility / 100)}`}>
                {avgCredibility}%
              </div>
              <p className="text-xs text-gray-600 mt-1">across sources</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="category">By Category</TabsTrigger>
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
                <CardDescription>Most recent 3I/ATLAS information from all monitored sources</CardDescription>
              </CardHeader>
              <CardContent>
                {articlesQuery.isLoading ? (
                  <div className="text-center py-8 text-gray-500">Loading articles...</div>
                ) : articles.length > 0 ? (
                  <div className="space-y-3">
                    {articles.map((article) => (
                      <div key={article.id} className="p-4 border rounded-lg hover:bg-gray-50 transition">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{article.title}</h3>
                            {article.summary && (
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{article.summary}</p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <Badge className={CATEGORY_COLORS[article.category] || CATEGORY_COLORS.other}>
                                {article.category.replace(/_/g, ' ')}
                              </Badge>
                            <span className={`text-sm font-medium ${getCredibilityColor(typeof article.credibilityScore === 'string' ? parseFloat(article.credibilityScore) : article.credibilityScore || 0)}`}>
                              {Math.round((typeof article.credibilityScore === 'string' ? parseFloat(article.credibilityScore) : article.credibilityScore || 0) * 100)}% credible
                            </span>
                            </div>
                          </div>
                          <div className="text-right text-xs text-gray-500">
                            {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : 'N/A'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">No articles found</div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-blue-600" />
                  About This Monitor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Streamdown>
This dashboard aggregates information about 3I/ATLAS from multiple authoritative sources including NASA, ESA, SETI Institute, and peer-reviewed publications.

Our AI-powered analysis engine cross-references claims across sources to identify probable truths versus speculation, with credibility scores based on source type and content analysis.
                </Streamdown>
              </CardContent>
            </Card>
          </TabsContent>

          {/* By Category Tab */}
          <TabsContent value="category" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Articles by Category</CardTitle>
                <CardDescription>Filter articles by topic</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.keys(CATEGORY_COLORS).map((category) => {
                  const categoryArticles = articles.filter((a) => a.category === category);
                  return (
                    <div key={category} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <Badge className={CATEGORY_COLORS[category]}>
                          {category.replace(/_/g, ' ')} ({categoryArticles.length})
                        </Badge>
                        {categoryArticles.length > 0 && (
                          <span className="text-sm text-gray-600">
                            Avg credibility: {Math.round((categoryArticles.reduce((sum, a) => sum + (typeof a.credibilityScore === 'string' ? parseFloat(a.credibilityScore) : a.credibilityScore || 0), 0) / categoryArticles.length) * 100)}%
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
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
                <CardDescription>News sources and space agencies being monitored</CardDescription>
              </CardHeader>
              <CardContent>
                {sourcesQuery.isLoading ? (
                  <div className="text-center py-8 text-gray-500">Loading sources...</div>
                ) : sources.length > 0 ? (
                  <div className="space-y-3">
                    {sources.map((source) => (
                      <div key={source.id} className="p-4 border rounded-lg hover:bg-gray-50 transition">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{source.name}</h3>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline">{source.sourceType.replace(/_/g, ' ')}</Badge>
                              {source.country && (
                                <span className="text-xs text-gray-600">{source.country}</span>
                              )}
                            </div>
                          </div>
                          <div className={`text-lg font-bold ${getCredibilityColor(typeof source.credibilityScore === 'string' ? parseFloat(source.credibilityScore) : source.credibilityScore || 0)}`}>
                            {Math.round((typeof source.credibilityScore === 'string' ? parseFloat(source.credibilityScore) : source.credibilityScore || 0) * 100)}%
                          </div>
                        </div>
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
                  <AlertTriangle className="h-5 w-5" />
                  Recent Alerts
                </CardTitle>
                <CardDescription>Significant changes and important updates</CardDescription>
              </CardHeader>
              <CardContent>
                {alertsQuery.isLoading ? (
                  <div className="text-center py-8 text-gray-500">Loading alerts...</div>
                ) : alerts.length > 0 ? (
                  <div className="space-y-3">
                    {alerts.map((alert) => (
                      <Alert key={alert.id} className="border-l-4" style={{
                        borderLeftColor: alert.severity === 'critical' ? '#dc2626' : alert.severity === 'high' ? '#f97316' : alert.severity === 'medium' ? '#eab308' : '#3b82f6',
                      }}>
                        <div className="flex items-start gap-3">
                          {SEVERITY_ICONS[alert.severity]}
                          <div className="flex-1">
                            <h4 className="font-semibold">{alert.title}</h4>
                            {alert.description && (
                              <AlertDescription className="mt-1">{alert.description}</AlertDescription>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                {alert.alertType.replace(/_/g, ' ')}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {new Date(alert.createdAt).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Alert>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">No alerts</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
