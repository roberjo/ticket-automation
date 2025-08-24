import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Download, Calendar, TrendingUp, BarChart3, PieChart, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SimpleChart } from '@/components/charts/SimpleChart';
import { authStore } from '@/stores/AuthStore';
import { taskStore } from '@/stores/TaskStore';

const generateReportData = () => {
  const data = [];
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      tasksCompleted: Math.floor(Math.random() * 15) + 5,
      tasksCreated: Math.floor(Math.random() * 20) + 8,
      avgDuration: Math.floor(Math.random() * 5) + 2,
      ticketsResolved: Math.floor(Math.random() * 25) + 10,
      cycleTime: Math.floor(Math.random() * 8) + 3
    });
  }
  
  return data;
};

const departmentData = [
  { name: 'Infrastructure', completed: 45, created: 52, avgCycleTime: 4.2 },
  { name: 'Development', completed: 38, created: 42, avgCycleTime: 3.8 },
  { name: 'Security', completed: 22, created: 28, avgCycleTime: 6.1 },
  { name: 'IT Operations', completed: 34, created: 39, avgCycleTime: 3.5 },
  { name: 'Administration', completed: 18, created: 21, avgCycleTime: 2.9 }
];

const ReportCard: React.FC<{
  title: string;
  description: string;
  children: React.ReactNode;
  onExport: () => void;
}> = ({ title, description, children, onExport }) => (
  <Card className="card-enterprise">
    <CardHeader className="flex flex-row items-center justify-between space-y-0">
      <div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </div>
      <Button variant="outline" size="sm" onClick={onExport} className="gap-2">
        <Download className="h-4 w-4" />
        Export
      </Button>
    </CardHeader>
    <CardContent>
      {children}
    </CardContent>
  </Card>
);

export const Reports: React.FC = observer(() => {
  const { activeUser } = authStore;
  const { metrics } = taskStore;
  const [timeRange, setTimeRange] = useState('30d');

  if (!activeUser || !['admin', 'manager'].includes(activeUser.role)) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Card className="card-enterprise">
          <CardContent className="p-8 text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
            <p className="text-muted-foreground">
              You need administrator or manager privileges to access reports.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const reportData = generateReportData();

  const handleExport = (reportType: string) => {
    console.log(`Exporting ${reportType} report...`);
    // In a real app, this would trigger a download
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Analytics & Reports</h1>
          <p className="text-muted-foreground mt-1">
            Key business metrics and performance analytics
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-input rounded-md"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>
          <Button className="btn-enterprise gap-2">
            <Download className="h-4 w-4" />
            Export All
          </Button>
        </div>
      </div>

      {/* Key Metrics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-metric">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-success" />
              <span className="text-sm font-medium">Completion Rate</span>
            </div>
            <div className="text-2xl font-bold">{metrics.taskCompletionRate.toFixed(1)}%</div>
            <div className="text-xs text-success">↑ 12.5% from last month</div>
          </CardContent>
        </Card>
        
        <Card className="card-metric">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-info" />
              <span className="text-sm font-medium">Avg Task Duration</span>
            </div>
            <div className="text-2xl font-bold">{metrics.avgTaskDuration} days</div>
            <div className="text-xs text-success">↓ 8.2% from last month</div>
          </CardContent>
        </Card>
        
        <Card className="card-metric">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-4 w-4 text-warning" />
              <span className="text-sm font-medium">Ticket Duration</span>
            </div>
            <div className="text-2xl font-bold">{metrics.avgTicketDuration} days</div>
            <div className="text-xs text-success">↓ 5.1% from last month</div>
          </CardContent>
        </Card>
        
        <Card className="card-metric">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <PieChart className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Cycle Time</span>
            </div>
            <div className="text-2xl font-bold">{metrics.avgCycleTime} days</div>
            <div className="text-xs text-success">↓ 15.3% from last month</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Completion Trends */}
        <ReportCard
          title="Task Completion Trends"
          description="Daily task completion vs creation over time"
          onExport={() => handleExport('task-completion-trends')}
        >
          <SimpleChart
            data={reportData}
            type="line"
            dataKey="tasksCompleted"
            xAxisKey="date"
            color="hsl(142, 76%, 36%)"
            height={300}
          />
          <div className="mt-4 text-sm text-muted-foreground">
            Green line shows completed tasks, helping track productivity trends
          </div>
        </ReportCard>

        {/* Cycle Time Analysis */}
        <ReportCard
          title="Cycle Time Analysis"
          description="Time from task creation to all tickets closed"
          onExport={() => handleExport('cycle-time-analysis')}
        >
          <SimpleChart
            data={reportData}
            type="area"
            dataKey="cycleTime"
            xAxisKey="date"
            color="hsl(214, 84%, 56%)"
            height={300}
          />
          <div className="mt-4 text-sm text-muted-foreground">
            Lower cycle time indicates more efficient task-to-completion workflows
          </div>
        </ReportCard>

        {/* Department Performance */}
        <ReportCard
          title="Department Performance"
          description="Task completion by department"
          onExport={() => handleExport('department-performance')}
        >
          <SimpleChart
            data={departmentData}
            type="bar"
            dataKey="completed"
            xAxisKey="name"
            color="hsl(214, 84%, 56%)"
            height={300}
          />
          <div className="mt-4 text-sm text-muted-foreground">
            Infrastructure and Development lead in task completion volume
          </div>
        </ReportCard>

        {/* ServiceNow Ticket Resolution */}
        <ReportCard
          title="ServiceNow Ticket Resolution"
          description="Daily ticket resolution trends"
          onExport={() => handleExport('ticket-resolution')}
        >
          <SimpleChart
            data={reportData}
            type="area"
            dataKey="ticketsResolved"
            xAxisKey="date"
            color="hsl(38, 92%, 50%)"
            height={300}
          />
          <div className="mt-4 text-sm text-muted-foreground">
            Tracking ServiceNow ticket closure rates and efficiency
          </div>
        </ReportCard>
      </div>

      {/* Department Details Table */}
      <Card className="card-enterprise">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Department Performance Details</CardTitle>
              <CardDescription>
                Detailed breakdown of task metrics by department
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => handleExport('department-details')} className="gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr className="text-left">
                  <th className="pb-3 font-medium">Department</th>
                  <th className="pb-3 font-medium">Tasks Completed</th>
                  <th className="pb-3 font-medium">Tasks Created</th>
                  <th className="pb-3 font-medium">Completion Rate</th>
                  <th className="pb-3 font-medium">Avg Cycle Time</th>
                  <th className="pb-3 font-medium">Performance</th>
                </tr>
              </thead>
              <tbody className="space-y-2">
                {departmentData.map((dept, index) => {
                  const completionRate = (dept.completed / dept.created * 100);
                  const performance = completionRate > 85 ? 'Excellent' : 
                                    completionRate > 70 ? 'Good' : 
                                    completionRate > 50 ? 'Fair' : 'Needs Improvement';
                  const performanceClass = completionRate > 85 ? 'text-success' : 
                                         completionRate > 70 ? 'text-info' : 
                                         completionRate > 50 ? 'text-warning' : 'text-destructive';
                  
                  return (
                    <tr key={index} className="border-b border-border/50">
                      <td className="py-3 font-medium">{dept.name}</td>
                      <td className="py-3">{dept.completed}</td>
                      <td className="py-3">{dept.created}</td>
                      <td className="py-3">{completionRate.toFixed(1)}%</td>
                      <td className="py-3">{dept.avgCycleTime} days</td>
                      <td className={`py-3 font-medium ${performanceClass}`}>{performance}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

export default Reports;