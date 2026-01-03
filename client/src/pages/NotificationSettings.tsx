import { useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { useLocation } from 'wouter';

export default function NotificationSettings() {
  const [, setLocation] = useLocation();
  const [isSaving, setIsSaving] = useState(false);

  const preferencesQuery = trpc.notifications.getPreferences.useQuery();
  const updateMutation = trpc.notifications.updatePreferences.useMutation();

  const [formData, setFormData] = useState({
    enableToastNotifications: true,
    enableNotificationCenter: true,
    toastDuration: 5000,
    enableNewArticles: true,
    enableAlerts: true,
    enableContradictions: true,
    enableSourceUpdates: true,
    doNotDisturbEnabled: false,
    doNotDisturbStart: '22:00',
    doNotDisturbEnd: '08:00',
    filterByCategory: [] as string[],
    filterBySeverity: [] as string[],
  });

  useEffect(() => {
    if (preferencesQuery.data) {
      const prefs = preferencesQuery.data as any;
      setFormData({
        enableToastNotifications: prefs.enableToastNotifications ?? true,
        enableNotificationCenter: prefs.enableNotificationCenter ?? true,
        toastDuration: prefs.toastDuration ?? 5000,
        enableNewArticles: prefs.enableNewArticles ?? true,
        enableAlerts: prefs.enableAlerts ?? true,
        enableContradictions: prefs.enableContradictions ?? true,
        enableSourceUpdates: prefs.enableSourceUpdates ?? true,
        doNotDisturbEnabled: prefs.doNotDisturbEnabled ?? false,
        doNotDisturbStart: prefs.doNotDisturbStart ?? '22:00',
        doNotDisturbEnd: prefs.doNotDisturbEnd ?? '08:00',
        filterByCategory: prefs.filterByCategory ? JSON.parse(prefs.filterByCategory) : [],
        filterBySeverity: prefs.filterBySeverity ? JSON.parse(prefs.filterBySeverity) : [],
      });
    }
  }, [preferencesQuery.data]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateMutation.mutateAsync({
        ...formData,
        filterByCategory: JSON.stringify(formData.filterByCategory),
        filterBySeverity: JSON.stringify(formData.filterBySeverity),
      });
      toast.success('Notification preferences saved');
    } catch (error) {
      toast.error('Failed to save preferences');
    } finally {
      setIsSaving(false);
    }
  };

  const categories = ['trajectory', 'composition', 'activity', 'government_statement', 'scientific_discovery', 'speculation', 'debunking', 'international_perspective'];
  const severities = ['low', 'medium', 'high', 'critical'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation('/dashboard')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notification Settings</h1>
            <p className="text-gray-600">Customize how you receive notifications</p>
          </div>
        </div>

        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Control notification delivery methods</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="toast">Toast Notifications</Label>
              <Switch
                id="toast"
                checked={formData.enableToastNotifications}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, enableToastNotifications: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="center">Notification Center</Label>
              <Switch
                id="center"
                checked={formData.enableNotificationCenter}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, enableNotificationCenter: checked })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Toast Duration (ms)</Label>
              <Input
                id="duration"
                type="number"
                min="1000"
                max="30000"
                step="1000"
                value={formData.toastDuration}
                onChange={(e) =>
                  setFormData({ ...formData, toastDuration: parseInt(e.target.value) })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Types */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Types</CardTitle>
            <CardDescription>Choose which notifications to receive</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="articles">New Articles</Label>
              <Switch
                id="articles"
                checked={formData.enableNewArticles}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, enableNewArticles: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="alerts">Alerts</Label>
              <Switch
                id="alerts"
                checked={formData.enableAlerts}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, enableAlerts: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="contradictions">Contradictions</Label>
              <Switch
                id="contradictions"
                checked={formData.enableContradictions}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, enableContradictions: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="updates">Source Updates</Label>
              <Switch
                id="updates"
                checked={formData.enableSourceUpdates}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, enableSourceUpdates: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Do Not Disturb */}
        <Card>
          <CardHeader>
            <CardTitle>Do Not Disturb</CardTitle>
            <CardDescription>Pause notifications during specific hours</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="dnd">Enable Do Not Disturb</Label>
              <Switch
                id="dnd"
                checked={formData.doNotDisturbEnabled}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, doNotDisturbEnabled: checked })
                }
              />
            </div>

            {formData.doNotDisturbEnabled && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start">Start Time</Label>
                  <Input
                    id="start"
                    type="time"
                    value={formData.doNotDisturbStart}
                    onChange={(e) =>
                      setFormData({ ...formData, doNotDisturbStart: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end">End Time</Label>
                  <Input
                    id="end"
                    type="time"
                    value={formData.doNotDisturbEnd}
                    onChange={(e) =>
                      setFormData({ ...formData, doNotDisturbEnd: e.target.value })
                    }
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filter by Category</CardTitle>
            <CardDescription>Only receive notifications for selected categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {categories.map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={`cat-${category}`}
                    checked={formData.filterByCategory.includes(category)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setFormData({
                          ...formData,
                          filterByCategory: [...formData.filterByCategory, category],
                        });
                      } else {
                        setFormData({
                          ...formData,
                          filterByCategory: formData.filterByCategory.filter((c) => c !== category),
                        });
                      }
                    }}
                  />
                  <Label htmlFor={`cat-${category}`} className="text-sm capitalize cursor-pointer">
                    {category.replace(/_/g, ' ')}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Severity Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filter by Severity</CardTitle>
            <CardDescription>Only receive notifications with selected severity levels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {severities.map((severity) => (
                <div key={severity} className="flex items-center space-x-2">
                  <Checkbox
                    id={`sev-${severity}`}
                    checked={formData.filterBySeverity.includes(severity)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setFormData({
                          ...formData,
                          filterBySeverity: [...formData.filterBySeverity, severity],
                        });
                      } else {
                        setFormData({
                          ...formData,
                          filterBySeverity: formData.filterBySeverity.filter((s) => s !== severity),
                        });
                      }
                    }}
                  />
                  <Label htmlFor={`sev-${severity}`} className="text-sm capitalize cursor-pointer">
                    {severity}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1"
          >
            {isSaving ? 'Saving...' : 'Save Preferences'}
          </Button>
          <Button
            variant="outline"
            onClick={() => setLocation('/dashboard')}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
