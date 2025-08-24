import React from 'react';
import { observer } from 'mobx-react-lite';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  TrendingUp, 
  Users, 
  Ticket,
  Calendar,
  Target
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SimpleChart } from '@/components/charts/SimpleChart';
import { authStore } from '@/stores/AuthStore';
import { taskStore } from '@/stores/TaskStore';

const MetricCard: React.FC<{
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}> = ({ title, value, description, icon, trend }) => (
  <Card className="card-metric">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className="text-muted-foreground">{icon}</div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">
        {description}
      </p>
      {trend && (
        <div className={`flex items-center gap-1 text-xs mt-1 ${
          trend.isPositive ? 'text-success' : 'text-destructive'
        }`}>
          <TrendingUp className="h-3 w-3" />
          {trend.isPositive ? '+' : ''}{trend.value}%
        </div>
      )}
    </CardContent>
  </Card>
);

const generateChartData = () => {
  const dates = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      completed: Math.floor(Math.random() * 20) + 5,
      created: Math.floor(Math.random() * 25) + 8,
      avgDuration: Math.floor(Math.random() * 5) + 2
    });
  }
  return dates;
};

const getMetricsForRole = (role: string, metrics: any) => {
  const baseMetrics = [
    {
      title: 'Task Completion Rate',
      value: `${metrics.taskCompletionRate.toFixed(1)}%`,
      description: 'Tasks completed successfully',
      icon: <Target className="h-4 w-4" />,
      trend: { value: 12.5, isPositive: true }
    },
    {
      title: 'Average Task Duration',
      value: `${metrics.avgTaskDuration} days`,
      description: 'From creation to completion',
      icon: <Clock className="h-4 w-4" />,
      trend: { value: -8.2, isPositive: true }
    },
    {
      title: 'ServiceNow Ticket Duration',
      value: `${metrics.avgTicketDuration} days`,
      description: 'Average ticket resolution time',
      icon: <Ticket className="h-4 w-4" />,
      trend: { value: -5.1, isPositive: true }
    },
    {
      title: 'Cycle Time',
      value: `${metrics.avgCycleTime} days`,
      description: 'Task to all tickets closed',
      icon: <Calendar className="h-4 w-4" />,
      trend: { value: -15.3, isPositive: true }
    }
  ];

  if (role === 'admin') {
    return [
      ...baseMetrics,
      {
        title: 'Total Active Users',
        value: authStore.demoUsers.length.toString(),
        description: 'Currently active users',
        icon: <Users className="h-4 w-4" />,
        trend: { value: 4.2, isPositive: true }
      },
      {
        title: 'Pending Approvals',
        value: metrics.pendingApprovals.toString(),
        description: 'Requires admin attention',
        icon: <AlertCircle className="h-4 w-4" />
      }
    ];
  }

  if (role === 'manager') {
    return [
      ...baseMetrics,
      {
        title: 'Team Tasks',
        value: metrics.totalTasks.toString(),
        description: 'Total team tasks this month',
        icon: <CheckCircle className="h-4 w-4" />,
        trend: { value: 18.7, isPositive: true }
      },
      {
        title: 'Pending Approvals',
        value: metrics.pendingApprovals.toString(),
        description: 'Awaiting your approval',
        icon: <AlertCircle className="h-4 w-4" />
      }
    ];
  }

  return baseMetrics.slice(0, 4);
};

export const Dashboard: React.FC = observer(() => {
  const { activeUser } = authStore;
  const { metrics } = taskStore;

  if (!activeUser) return null;

  const roleMetrics = getMetricsForRole(activeUser.role, metrics);
  const chartData = generateChartData();

  const statusData = [
    { name: 'Completed', value: 45, color: 'hsl(142, 76%, 36%)' },
    { name: 'In Progress', value: 30, color: 'hsl(214, 84%, 56%)' },
    { name: 'Pending', value: 15, color: 'hsl(38, 92%, 50%)' },
    { name: 'Overdue', value: 10, color: 'hsl(0, 84%, 60%)' }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">
            Welcome back, {activeUser.name}
          </h1>
          <p className="text-muted-foreground mt-1">
            {activeUser.role.replace('_', ' ').toUpperCase()} Dashboard • {activeUser.department}
          </p>
        </div>
        
        {authStore.isDemoMode && (
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
            <div className="text-sm font-medium text-primary">Demo Mode Active</div>
            <div className="text-xs text-primary/80">Showing sample data for demonstration</div>
          </div>
        )}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {roleMetrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Trends */}
        <Card className="card-enterprise">
          <CardHeader>
            <CardTitle>Task Activity Trends</CardTitle>
            <CardDescription>
              Daily task creation and completion over the last week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleChart
              data={chartData}
              type="area"
              dataKey="completed"
              xAxisKey="date"
              color="hsl(142, 76%, 36%)"
              height={300}
            />
          </CardContent>
        </Card>

        {/* Task Status Distribution */}
        <Card className="card-enterprise">
          <CardHeader>
            <CardTitle>Task Status Distribution</CardTitle>
            <CardDescription>
              Current breakdown of task statuses across your organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleChart
              data={statusData}
              type="pie"
              dataKey="value"
              height={300}
            />
          </CardContent>
        </Card>

        {/* Duration Trends */}
        <Card className="card-enterprise">
          <CardHeader>
            <CardTitle>Average Task Duration</CardTitle>
            <CardDescription>
              How long tasks are taking to complete (in days)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleChart
              data={chartData}
              type="line"
              dataKey="avgDuration"
              xAxisKey="date"
              color="hsl(214, 84%, 56%)"
              height={300}
            />
          </CardContent>
        </Card>

        {/* Task Volume */}
        <Card className="card-enterprise">
          <CardHeader>
            <CardTitle>Task Creation Volume</CardTitle>
            <CardDescription>
              Number of new tasks created each day
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleChart
              data={chartData}
              type="bar"
              dataKey="created"
              xAxisKey="date"
              color="hsl(214, 84%, 56%)"
              height={300}
            />
          </CardContent>
        </Card>
      </div>

      {/* Role-specific sections */}
      {activeUser.role === 'admin' && (
        <Card className="card-enterprise">
          <CardHeader>
            <CardTitle>System Overview</CardTitle>
            <CardDescription>
              Enterprise-wide statistics and health indicators
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-primary">{metrics.totalTasks}</div>
                <div className="text-sm text-muted-foreground">Total Tasks</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-primary">{metrics.totalTickets}</div>
                <div className="text-sm text-muted-foreground">ServiceNow Tickets</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-primary">{authStore.demoUsers.length}</div>
                <div className="text-sm text-muted-foreground">Active Users</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeUser.role === 'manager' && (
        <Card className="card-enterprise">
          <CardHeader>
            <CardTitle>Team Management</CardTitle>
            <CardDescription>
              Quick actions and team performance overview
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1 p-4 border rounded-lg text-center">
                <div className="text-lg font-semibold">Pending Approvals</div>
                <div className="text-2xl font-bold text-warning">{metrics.pendingApprovals}</div>
              </div>
              <div className="flex-1 p-4 border rounded-lg text-center">
                <div className="text-lg font-semibold">Team Tasks</div>
                <div className="text-2xl font-bold text-primary">{metrics.totalTasks}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
});

export default Dashboard;