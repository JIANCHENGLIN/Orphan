import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { ReviewStatusBadge, type ReviewStatus } from "./ReviewStatusBadge";
import { Badge } from "./ui/badge";
import { ArrowLeft, Search, Edit, Eye } from "lucide-react";

interface RejectedRecord {
  id: string;
  recordId: string;
  caseName: string;
  serviceDate: string;
  rejectedDate: string;
  supervisorName: string;
  rejectionReason: string;
  rejectionCategory: string;
  status: 'rejected' | 'in_revision';
}

interface ApprovedRecord {
  id: string;
  recordId: string;
  caseName: string;
  serviceDate: string;
  supervisorName: string;
  approvedDate: string;
  supervisorSuggestion?: string;
}

interface SocialWorkerDashboardProps {
  socialWorkerName: string;
  onBack: () => void;
  onEditRecord: (recordId: string) => void;
  onViewRecord: (recordId: string) => void;
}

// 模擬退回紀錄資料
const mockRejectedRecords: RejectedRecord[] = [
  {
    id: 'REJ001',
    recordId: 'R20240915001',
    caseName: '王小明',
    serviceDate: '2024-09-15',
    rejectedDate: '2024-09-16',
    supervisorName: '張督導',
    rejectionReason: '經濟扶助的申請金額與個案實際需求不符，請重新評估並提供詳細的經濟狀況分析。另外，處遇計劃的短期目標過於模糊，需要更具體的行動方案。',
    rejectionCategory: '需要補充資料',
    status: 'rejected'
  },
  {
    id: 'REJ002',
    recordId: 'R20240914002',
    caseName: '李美華',
    serviceDate: '2024-09-14',
    rejectedDate: '2024-09-15',
    supervisorName: '陳督導',
    rejectionReason: '服務方案的執行期程與個案的學業安排有衝突，請與個案重新協調適合的時間安排。',
    rejectionCategory: '服務不當',
    status: 'in_revision'
  }
];

// 模擬已核准紀錄資料
const mockApprovedRecords: ApprovedRecord[] = [
  {
    id: 'APP001',
    recordId: 'R20240913001',
    caseName: '陳志強',
    serviceDate: '2024-09-13',
    supervisorName: '張督導',
    approvedDate: '2024-09-14',
    supervisorSuggestion: '服務內容適當，建議持續關注個案的就業輔導進度，並適時提供相關資源連結。'
  },
  {
    id: 'APP002',
    recordId: 'R20240912001',
    caseName: '張淑芬',
    serviceDate: '2024-09-12',
    supervisorName: '李督導',
    approvedDate: '2024-09-13',
    supervisorSuggestion: '心理諮商的安排很適切，請注意個案的情緒變化並及時調整服務方式。'
  },
  {
    id: 'APP003',
    recordId: 'R20240911001',
    caseName: '劉建國',
    serviceDate: '2024-09-11',
    supervisorName: '張督導',
    approvedDate: '2024-09-12'
  }
];

export function SocialWorkerDashboard({ 
  socialWorkerName, 
  onBack, 
  onEditRecord, 
  onViewRecord 
}: SocialWorkerDashboardProps) {
  const [activeTab, setActiveTab] = useState<'rejected' | 'in_revision' | 'approved'>('rejected');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [supervisorFilter, setSupervisorFilter] = useState('all');

  const rejectedCount = mockRejectedRecords.filter(r => r.status === 'rejected').length;
  const approvedCount = mockApprovedRecords.length;
  const revisionCount = mockRejectedRecords.filter(r => r.status === 'in_revision').length;

  const filteredRejectedRecords = mockRejectedRecords.filter(record => {
    const matchesSearch = record.caseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.recordId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSupervisor = supervisorFilter === 'all' || record.supervisorName === supervisorFilter;
    const matchesStatus = record.status === 'rejected';
    return matchesSearch && matchesSupervisor && matchesStatus;
  });

  const filteredInRevisionRecords = mockRejectedRecords.filter(record => {
    const matchesSearch = record.caseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.recordId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSupervisor = supervisorFilter === 'all' || record.supervisorName === supervisorFilter;
    const matchesStatus = record.status === 'in_revision';
    return matchesSearch && matchesSupervisor && matchesStatus;
  });

  const filteredApprovedRecords = mockApprovedRecords.filter(record => {
    const matchesSearch = record.caseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.recordId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSupervisor = supervisorFilter === 'all' || record.supervisorName === supervisorFilter;
    return matchesSearch && matchesSupervisor;
  });

  const uniqueSupervisors = Array.from(new Set([
    ...mockRejectedRecords.map(r => r.supervisorName),
    ...mockApprovedRecords.map(r => r.supervisorName)
  ]));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 頁面標題列 */}
      <div 
        className="bg-white border-b shadow-sm"
        style={{ borderColor: 'var(--color-review-field-border)' }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                返回首頁
              </Button>
              <div>
                <h1 className="text-xl font-bold">{socialWorkerName}的審核狀態</h1>
                <p className="text-sm text-gray-600">服務紀錄審核狀態管理</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">


        {/* 標籤切換 */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('rejected')}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'rejected'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            已退回紀錄 ({rejectedCount})
          </button>
          <button
            onClick={() => setActiveTab('in_revision')}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'in_revision'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            修正中紀錄 ({revisionCount})
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'approved'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            已核准紀錄 ({approvedCount})
          </button>
        </div>

        {/* 搜尋和篩選 */}
        <div 
          className="p-4 rounded-lg border"
          style={{ 
            backgroundColor: 'var(--color-review-medium-bg)',
            borderColor: 'var(--color-review-field-border)'
          }}
        >
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">搜尋</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="搜尋個案姓名或紀錄編號..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <label className="block text-sm font-medium mb-2">督導</label>
              <Select value={supervisorFilter} onValueChange={setSupervisorFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部督導</SelectItem>
                  {uniqueSupervisors.map(supervisor => (
                    <SelectItem key={supervisor} value={supervisor}>
                      {supervisor}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* 內容區域 */}
        {activeTab === 'rejected' && (
          <Card>
            <CardHeader>
              <CardTitle>已退回紀錄處理</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>紀錄編號</TableHead>
                    <TableHead>個案姓名</TableHead>
                    <TableHead>退回日期</TableHead>
                    <TableHead>退回類別</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRejectedRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-mono text-sm">
                        {record.recordId}
                      </TableCell>
                      <TableCell className="font-medium">
                        {record.caseName}
                      </TableCell>
                      <TableCell className="text-red-600">
                        {record.rejectedDate}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-orange-600 border-orange-600">
                          {record.rejectionCategory}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onViewRecord(record.recordId)}
                          className="text-xs px-3 py-1 flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          查看
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredRejectedRecords.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  <p>沒有找到符合條件的退回紀錄</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'in_revision' && (
          <Card>
            <CardHeader>
              <CardTitle>修正中紀錄</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>紀錄編號</TableHead>
                    <TableHead>個案姓名</TableHead>
                    <TableHead>退回日期</TableHead>
                    <TableHead>退回類別</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInRevisionRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-mono text-sm">
                        {record.recordId}
                      </TableCell>
                      <TableCell className="font-medium">
                        {record.caseName}
                      </TableCell>
                      <TableCell className="text-orange-600">
                        {record.rejectedDate}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-orange-600 border-orange-600">
                          {record.rejectionCategory}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            onClick={() => onEditRecord(record.recordId)}
                            className="review-button-quick text-xs px-3 py-1 flex items-center gap-1"
                          >
                            <Edit className="w-3 h-3" />
                            繼續修正
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onViewRecord(record.recordId)}
                            className="text-xs px-3 py-1 flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            查看
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredInRevisionRecords.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  <p>沒有找到符合條件的修正中紀錄</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'approved' && (
          <Card>
            <CardHeader>
              <CardTitle>已核准紀錄</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>紀錄編號</TableHead>
                    <TableHead>個案姓名</TableHead>
                    <TableHead>服務日期</TableHead>
                    <TableHead>督導</TableHead>
                    <TableHead>核准日期</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApprovedRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-mono text-sm">
                        {record.recordId}
                      </TableCell>
                      <TableCell className="font-medium">
                        {record.caseName}
                      </TableCell>
                      <TableCell>{record.serviceDate}</TableCell>
                      <TableCell>{record.supervisorName}</TableCell>
                      <TableCell className="text-green-600">
                        {record.approvedDate}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onViewRecord(record.recordId)}
                          className="text-xs px-3 py-1 flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          查看
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredApprovedRecords.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  <p>沒有找到符合條件的已核准紀錄</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}