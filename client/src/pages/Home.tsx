import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Loader2, Globe, TrendingUp, Shield, Zap } from "lucide-react";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect to dashboard if authenticated
  useEffect(() => {
    if (isAuthenticated && !loading) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, loading, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
      </div>
    );
  }

  if (isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="h-8 w-8 text-blue-400" />
            <span className="text-2xl font-bold text-white">3I ATLAS Monitor</span>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
              Monitor 3I/ATLAS
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                {" "}Truth
              </span>
            </h1>
            <p className="text-xl text-slate-300 leading-relaxed">
              Real-time aggregation and AI-powered analysis of 3I/ATLAS information from global sources. Distinguish probable truths from speculation with credibility scoring and multi-perspective comparisons.
            </p>
            <div className="flex gap-4">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => setLocation("/dashboard")}
              >
                Get Started
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-800"
              >
                Learn More
              </Button>
            </div>
          </div>

          {/* Feature Preview */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur-3xl opacity-20"></div>
            <div className="relative bg-slate-800 rounded-2xl p-8 border border-slate-700 space-y-4">
              <div className="h-3 bg-slate-700 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-2 bg-slate-700 rounded w-full"></div>
                <div className="h-2 bg-slate-700 rounded w-5/6"></div>
              </div>
              <div className="pt-4 space-y-3">
                <div className="flex gap-2">
                  <div className="h-6 w-16 bg-blue-600 rounded"></div>
                  <div className="h-6 w-20 bg-green-600 rounded"></div>
                </div>
                <div className="h-2 bg-slate-700 rounded w-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-white mb-12 text-center">
          Powerful Monitoring Capabilities
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-blue-500 transition-colors">
            <TrendingUp className="h-8 w-8 text-blue-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Real-Time Updates</h3>
            <p className="text-slate-400 text-sm">
              Continuous monitoring of 3I/ATLAS information from NASA, ESA, SETI, and global sources
            </p>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-blue-500 transition-colors">
            <Shield className="h-8 w-8 text-green-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Credibility Scoring</h3>
            <p className="text-slate-400 text-sm">
              AI-powered assessment of source reliability and information accuracy
            </p>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-blue-500 transition-colors">
            <Zap className="h-8 w-8 text-yellow-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Smart Analysis</h3>
            <p className="text-slate-400 text-sm">
              Cross-reference claims across sources to identify contradictions and consensus
            </p>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-blue-500 transition-colors">
            <Globe className="h-8 w-8 text-cyan-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Global Perspective</h3>
            <p className="text-slate-400 text-sm">
              Compare how different countries and organizations report the same events
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Start Monitoring 3I/ATLAS Today
          </h2>
          <p className="text-lg text-blue-100 mb-8">
            Access real-time analysis and credibility assessments of 3I/ATLAS information
          </p>
          <Button
            size="lg"
            className="bg-white text-blue-600 hover:bg-blue-50"
            onClick={() => setLocation("/dashboard")}
          >
            Sign In to Dashboard
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-900 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-6 text-center text-slate-400 text-sm">
          <p>
            3I ATLAS Monitor aggregates information from official space agencies and peer-reviewed sources.
            All credibility scores are based on source type and content analysis.
          </p>
        </div>
      </footer>
    </div>
  );
}
