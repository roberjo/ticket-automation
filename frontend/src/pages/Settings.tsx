import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Settings as SettingsIcon, Save, RefreshCw, Bell, Shield, Database, Palette } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { authStore } from '@/stores/AuthStore';

const SettingsSection: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, description, icon, children }) => (
  <Card className="card-enterprise">
    <CardHeader>
      <div className="flex items-center gap-3">
        <div className="text-primary">{icon}</div>
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </div>
    </CardHeader>
    <CardContent className="space-y-4">
      {children}
    </CardContent>
  </Card>
);

export const Settings: React.FC = observer(() => {
  const { activeUser } = authStore;
  const [settings, setSettings] = useState({
    // User Preferences
    emailNotifications: true,
    browserNotifications: false,
    weeklyReports: true,
    
    // System Settings (Admin only)
    autoAssignment: true,
    ticketCreationDelay: 5,
    maxConcurrentTasks: 50,
    
    // ServiceNow Integration
    serviceNowUrl: 'https://company.service-now.com',
    apiTimeout: 30,
    retryAttempts: 3,
    
    // Security
    sessionTimeout: 480,
    mfaRequired: false,
    passwordExpiry: 90
  });

  const handleSave = () => {
    console.log('Saving settings:', settings);
    // In a real app, this would save to backend
  };

  const handleReset = () => {
    // Reset to defaults
    setSettings({
      emailNotifications: true,
      browserNotifications: false,
      weeklyReports: true,
      autoAssignment: true,
      ticketCreationDelay: 5,
      maxConcurrentTasks: 50,
      serviceNowUrl: 'https://company.service-now.com',
      apiTimeout: 30,
      retryAttempts: 3,
      sessionTimeout: 480,
      mfaRequired: false,
      passwordExpiry: 90
    });
  };

  if (!activeUser) return null;

  const isAdmin = activeUser.role === 'admin';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Configure your preferences and system settings
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleReset} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Reset to Defaults
          </Button>
          <Button onClick={handleSave} className="btn-enterprise gap-2">
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Preferences */}
        <SettingsSection
          title="Notifications"
          description="Manage your notification preferences"
          icon={<Bell className="h-5 w-5" />}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive email updates for task status changes
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, emailNotifications: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="browser-notifications">Browser Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Show notifications in your browser
                </p>
              </div>
              <Switch
                id="browser-notifications"
                checked={settings.browserNotifications}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, browserNotifications: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="weekly-reports">Weekly Reports</Label>
                <p className="text-sm text-muted-foreground">
                  Receive weekly performance reports
                </p>
              </div>
              <Switch
                id="weekly-reports"
                checked={settings.weeklyReports}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, weeklyReports: checked }))
                }
              />
            </div>
          </div>
        </SettingsSection>

        {/* ServiceNow Integration */}
        <SettingsSection
          title="ServiceNow Integration"
          description="Configure ServiceNow connection settings"
          icon={<Database className="h-5 w-5" />}
        >
          <div className="space-y-4">
            <div>
              <Label htmlFor="servicenow-url">ServiceNow Instance URL</Label>
              <Input
                id="servicenow-url"
                value={settings.serviceNowUrl}
                onChange={(e) => 
                  setSettings(prev => ({ ...prev, serviceNowUrl: e.target.value }))
                }
                placeholder="https://company.service-now.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="api-timeout">API Timeout (seconds)</Label>
                <Input
                  id="api-timeout"
                  type="number"
                  value={settings.apiTimeout}
                  onChange={(e) => 
                    setSettings(prev => ({ ...prev, apiTimeout: parseInt(e.target.value) || 30 }))
                  }
                />
              </div>

              <div>
                <Label htmlFor="retry-attempts">Retry Attempts</Label>
                <Input
                  id="retry-attempts"
                  type="number"
                  value={settings.retryAttempts}
                  onChange={(e) => 
                    setSettings(prev => ({ ...prev, retryAttempts: parseInt(e.target.value) || 3 }))
                  }
                />
              </div>
            </div>
          </div>
        </SettingsSection>

        {/* System Settings (Admin only) */}
        {isAdmin && (
          <SettingsSection
            title="System Configuration"
            description="Admin-only system settings"
            icon={<SettingsIcon className="h-5 w-5" />}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-assignment">Auto Assignment</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically assign tasks based on rules
                  </p>
                </div>
                <Switch
                  id="auto-assignment"
                  checked={settings.autoAssignment}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, autoAssignment: checked }))
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ticket-delay">Ticket Creation Delay (minutes)</Label>
                  <Input
                    id="ticket-delay"
                    type="number"
                    value={settings.ticketCreationDelay}
                    onChange={(e) => 
                      setSettings(prev => ({ ...prev, ticketCreationDelay: parseInt(e.target.value) || 5 }))
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="max-tasks">Max Concurrent Tasks</Label>
                  <Input
                    id="max-tasks"
                    type="number"
                    value={settings.maxConcurrentTasks}
                    onChange={(e) => 
                      setSettings(prev => ({ ...prev, maxConcurrentTasks: parseInt(e.target.value) || 50 }))
                    }
                  />
                </div>
              </div>
            </div>
          </SettingsSection>
        )}

        {/* Security Settings */}
        <SettingsSection
          title="Security"
          description="Security and authentication settings"
          icon={<Shield className="h-5 w-5" />}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="mfa-required">Multi-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">
                  Require MFA for account access
                </p>
              </div>
              <Switch
                id="mfa-required"
                checked={settings.mfaRequired}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, mfaRequired: checked }))
                }
                disabled={!isAdmin}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                <Input
                  id="session-timeout"
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => 
                    setSettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) || 480 }))
                  }
                  disabled={!isAdmin}
                />
              </div>

              <div>
                <Label htmlFor="password-expiry">Password Expiry (days)</Label>
                <Input
                  id="password-expiry"
                  type="number"
                  value={settings.passwordExpiry}
                  onChange={(e) => 
                    setSettings(prev => ({ ...prev, passwordExpiry: parseInt(e.target.value) || 90 }))
                  }
                  disabled={!isAdmin}
                />
              </div>
            </div>
          </div>
        </SettingsSection>

        {/* Appearance */}
        <SettingsSection
          title="Appearance"
          description="Customize the look and feel"
          icon={<Palette className="h-5 w-5" />}
        >
          <div className="space-y-4">
            <div>
              <Label>Theme</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Choose your preferred color scheme
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="justify-start">
                  Light Mode
                </Button>
                <Button variant="outline" className="justify-start">
                  Dark Mode
                </Button>
              </div>
            </div>

            <div>
              <Label>Density</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Adjust interface density
              </p>
              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" size="sm">Compact</Button>
                <Button variant="default" size="sm">Default</Button>
                <Button variant="outline" size="sm">Comfortable</Button>
              </div>
            </div>
          </div>
        </SettingsSection>
      </div>

      {/* Demo Mode Notice */}
      {authStore.isDemoMode && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <div className="text-sm">
                <span className="font-medium">Demo Mode:</span> Settings changes are simulated and won't persist in the actual system.
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
});

export default Settings;