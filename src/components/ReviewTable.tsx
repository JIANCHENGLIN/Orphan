import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ReviewStatusBadge, type ReviewStatus } from "./ReviewStatusBadge";
import { QuickReviewModal, type ReviewCase } from "./QuickReviewModal";
import { Search, Zap, Eye, Calendar as CalendarIcon, Users, Clock } from "lucide-react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

interface ReviewTableProps {
  cases: ReviewCase[];
  onQuickReview: (caseId: string, decision: 'approve' | 'reject', notes: string) => void;
  onDetailedReview: (caseId: string) => void;
  onViewDetails: (caseId: string) => void;
  onViewDetailsReadOnly: (caseId: string) => void;
  onRejectCase: (reviewCase: ReviewCase) => void;
}

export function ReviewTable({ cases, onQuickReview, onDetailedReview, onViewDetails, onViewDetailsReadOnly, onRejectCase }: ReviewTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedCase, setSelectedCase] = useState<ReviewCase | null>(null);
  const [isQuickReviewOpen, setIsQuickReviewOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  // 根據標籤篩選案件
  const getFilteredCases = (status: string) => {
    let statusFilter: ReviewStatus[] = [];
    
    switch (status) {
      case 'pending':
        statusFilter = ['pending'];
        break;
      case 'approved':
        statusFilter = ['approved'];
        break;
      case 'rejected':
        statusFilter = ['rejected'];
        break;
      default:
        statusFilter = ['pending', 'approved', 'rejected'];
    }
    
    return cases.filter(reviewCase => {
      const matchesSearch = reviewCase.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           reviewCase.caseType.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter.includes(reviewCase.status);
      
      // 日期區間篩選
      let matchesDateRange = true;
      if (startDate || endDate) {
        const caseDate = new Date(reviewCase.applicationDate);
        
        if (startDate && endDate) {
          // 如果有開始日期和結束日期，檢查案件日期是否在區間內
          matchesDateRange = caseDate >= startDate && caseDate <= endDate;
        } else if (startDate) {
          // 只有開始日期，檢查案件日期是否在開始日期之後（含當天）
          matchesDateRange = caseDate >= startDate;
        } else if (endDate) {
          // 只有結束日期，檢查案件日期是否在結束日期之前（含當天）
          matchesDateRange = caseDate <= endDate;
        }
      }
      
      return matchesSearch && matchesStatus && matchesDateRange;
    });
  };

  const filteredCases = getFilteredCases(activeTab);

  // 統計數據
  const pendingCount = cases.filter(c => c.status === 'pending').length;
  const approvedCount = cases.filter(c => c.status === 'approved').length;
  const rejectedCount = cases.filter(c => c.status === 'rejected').length;

  const handleQuickReviewClick = (reviewCase: ReviewCase) => {
    setSelectedCase(reviewCase);
    setIsQuickReviewOpen(true);
  };

  const handleQuickReviewSubmit = (caseId: string, decision: 'approve' | 'reject', notes: string) => {
    onQuickReview(caseId, decision, notes);
  };

  return (
    <div className="space-y-6">
      {/* 頁面標題和督導資訊 */}
      <div 
        className="p-6 rounded-lg border"
        style={{ 
          backgroundColor: 'var(--color-review-major-bg)',
          borderColor: 'var(--color-review-field-border)'
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">督導審核中心</h1>
            <p className="text-gray-600 mt-1">管理服務紀錄審核，提供專業督導指導</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">當前待審核</p>
            <p className="text-3xl font-bold text-red-600">{pendingCount}</p>
          </div>
        </div>
        
        {/* 本月審核概況 - 移除統計卡片 */}
        {/* 統計卡片已移除，保持頁面簡潔 */}
      </div>

      {/* 搜尋區域 */}
      <div 
        className="p-6 rounded-lg border"
        style={{ 
          backgroundColor: 'var(--color-review-medium-bg)',
          borderColor: 'var(--color-review-field-border)'
        }}
      >
        <h2 className="text-lg font-medium mb-2">案件搜尋與篩選</h2>
        <p className="text-sm text-gray-600 mb-4">可依個案姓名搜尋，並選擇服務日期區間進行篩選（可單獨選擇開始或結束日期）</p>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">個案姓名搜尋</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="搜尋個案姓名"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                style={{ 
                  backgroundColor: 'var(--color-review-field-bg)',
                  borderColor: 'var(--color-review-field-border)'
                }}
              />
            </div>
          </div>
          <div className="w-48">
            <label className="block text-sm font-medium mb-2">開始日期</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                  style={{ 
                    backgroundColor: 'var(--color-review-field-bg)',
                    borderColor: 'var(--color-review-field-border)'
                  }}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "yyyy/MM/dd", { locale: zhCN }) : "選擇開始日期"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="w-48">
            <label className="block text-sm font-medium mb-2">結束日期</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                  style={{ 
                    backgroundColor: 'var(--color-review-field-bg)',
                    borderColor: 'var(--color-review-field-border)'
                  }}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "yyyy/MM/dd", { locale: zhCN }) : "選擇結束日期"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex flex-col gap-2">
            <div className="h-6"></div> {/* 對齊空間 */}
            <Button
              variant="outline"
              onClick={() => {
                setStartDate(undefined);
                setEndDate(undefined);
              }}
              className="h-10 px-3 text-sm"
              style={{ 
                backgroundColor: 'var(--color-review-field-bg)',
                borderColor: 'var(--color-review-field-border)'
              }}
            >
              清除日期
            </Button>
          </div>
        </div>
      </div>

      {/* 標籤切換和案件列表 */}
      <div 
        className="rounded-lg border overflow-hidden"
        style={{ 
          backgroundColor: 'var(--color-review-field-bg)',
          borderColor: 'var(--color-review-field-border)'
        }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b bg-gray-50 px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium">案件列表</h2>
              <p className="text-sm text-gray-600">
                共 {filteredCases.length} 筆案件
              </p>
            </div>
            <TabsList className="grid w-full grid-cols-3 bg-white">
              <TabsTrigger 
                value="pending" 
                className="flex items-center gap-2 data-[state=active]:bg-red-50 data-[state=active]:text-red-700"
              >
                待審核 
                <Badge className="review-status-pending ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  {pendingCount}
                </Badge>
              </TabsTrigger>
              <TabsTrigger 
                value="approved"
                className="flex items-center gap-2 data-[state=active]:bg-green-50 data-[state=active]:text-green-700"
              >
                已核准
                <Badge className="review-status-approved ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  {approvedCount}
                </Badge>
              </TabsTrigger>
              <TabsTrigger 
                value="rejected"
                className="flex items-center gap-2 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700"
              >
                已退回
                <Badge className="review-status-rejected ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  {rejectedCount}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="pending" className="m-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>操作</TableHead>
                  <TableHead>CaseID</TableHead>
                  <TableHead>個案編號</TableHead>
                  <TableHead>個案姓名</TableHead>
                  <TableHead>主責社工</TableHead>
                  <TableHead>送審人</TableHead>
                  <TableHead>紀錄表編號</TableHead>
                  <TableHead>服務日期</TableHead>
                  <TableHead>紀錄摘要</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCases.map((reviewCase, index) => (
                  <TableRow 
                    key={reviewCase.id}
                    className={`hover:bg-gray-50 transition-colors ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                    }`}
                  >
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleQuickReviewClick(reviewCase)}
                          className="review-button-quick text-xs px-3 py-1 flex items-center gap-1"
                        >
                          <Zap className="w-3 h-3" />
                          快審
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => onRejectCase(reviewCase)}
                          className="review-button-reject text-xs px-3 py-1"
                        >
                          退回
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm" style={{ color: 'var(--color-review-link-color)' }}>
                      {reviewCase.caseNumber}|{reviewCase.recordId}
                    </TableCell>
                    <TableCell className="font-mono text-sm" style={{ color: 'var(--color-review-link-color)' }}>
                      {reviewCase.caseNumber}
                    </TableCell>
                    <TableCell className="font-medium">
                      {reviewCase.applicantName}
                    </TableCell>
                    <TableCell className="font-medium">
                      {reviewCase.socialWorkerName}
                    </TableCell>
                    <TableCell className="font-medium">
                      {reviewCase.socialWorkerName}
                    </TableCell>
                    <TableCell className="font-mono text-sm" style={{ color: 'var(--color-review-link-color)' }}>
                      {reviewCase.recordId}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {reviewCase.applicationDate}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="text-sm text-gray-700 truncate">
                        {reviewCase.caseType} - {reviewCase.amount} | 個案狀況穩定，持續追蹤中
                      </p>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs mt-1 p-0 h-auto text-blue-600 hover:text-blue-800"
                        onClick={() => onViewDetails(reviewCase.id)}
                      >
                        內容詳情
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="approved" className="m-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>CaseID</TableHead>
                  <TableHead>個案編號</TableHead>
                  <TableHead>個案姓名</TableHead>
                  <TableHead>主責社工</TableHead>
                  <TableHead>送審人</TableHead>
                  <TableHead>紀錄表編號</TableHead>
                  <TableHead>服務日期</TableHead>
                  <TableHead>紀錄摘要</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCases.map((reviewCase, index) => (
                  <TableRow 
                    key={reviewCase.id}
                    className={`hover:bg-gray-50 transition-colors ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                    }`}
                  >
                    <TableCell className="font-mono text-sm" style={{ color: 'var(--color-review-link-color)' }}>
                      {reviewCase.caseNumber}|{reviewCase.recordId}
                    </TableCell>
                    <TableCell className="font-mono text-sm" style={{ color: 'var(--color-review-link-color)' }}>
                      {reviewCase.caseNumber}
                    </TableCell>
                    <TableCell className="font-medium">
                      {reviewCase.applicantName}
                    </TableCell>
                    <TableCell className="font-medium">
                      {reviewCase.socialWorkerName}
                    </TableCell>
                    <TableCell className="font-medium">
                      {reviewCase.socialWorkerName}
                    </TableCell>
                    <TableCell className="font-mono text-sm" style={{ color: 'var(--color-review-link-color)' }}>
                      {reviewCase.recordId}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {reviewCase.applicationDate}
                    </TableCell>
                    <TableCell className="max-w-md">
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm font-medium text-gray-800">服務紀錄：</p>
                          <p className="text-sm text-gray-700 line-clamp-2">
                            {reviewCase.serviceNotes || '暫無詳細紀錄'}
                          </p>
                        </div>
                        {reviewCase.reviewComments && (
                          <div>
                            <p className="text-sm font-medium text-green-700">督導意見：</p>
                            <p className="text-sm text-green-600 line-clamp-2">
                              {reviewCase.reviewComments}
                            </p>
                          </div>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-xs mt-1 p-0 h-auto text-blue-600 hover:text-blue-800"
                          onClick={() => onViewDetailsReadOnly(reviewCase.id)}
                        >
                          查看完整內容
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="rejected" className="m-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>CaseID</TableHead>
                  <TableHead>個案編號</TableHead>
                  <TableHead>個案姓名</TableHead>
                  <TableHead>主責社工</TableHead>
                  <TableHead>送審人</TableHead>
                  <TableHead>紀錄表編號</TableHead>
                  <TableHead>服務日期</TableHead>
                  <TableHead>紀錄摘要</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCases.map((reviewCase, index) => (
                  <TableRow 
                    key={reviewCase.id}
                    className={`hover:bg-gray-50 transition-colors ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                    }`}
                  >
                    <TableCell className="font-mono text-sm" style={{ color: 'var(--color-review-link-color)' }}>
                      {reviewCase.caseNumber}|{reviewCase.recordId}
                    </TableCell>
                    <TableCell className="font-mono text-sm" style={{ color: 'var(--color-review-link-color)' }}>
                      {reviewCase.caseNumber}
                    </TableCell>
                    <TableCell className="font-medium">
                      {reviewCase.applicantName}
                    </TableCell>
                    <TableCell className="font-medium">
                      {reviewCase.socialWorkerName}
                    </TableCell>
                    <TableCell className="font-medium">
                      {reviewCase.socialWorkerName}
                    </TableCell>
                    <TableCell className="font-mono text-sm" style={{ color: 'var(--color-review-link-color)' }}>
                      {reviewCase.recordId}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {reviewCase.applicationDate}
                    </TableCell>
                    <TableCell className="max-w-md">
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm font-medium text-gray-800">服務紀錄：</p>
                          <p className="text-sm text-gray-700 line-clamp-2">
                            {reviewCase.serviceNotes || '暫無詳細紀錄'}
                          </p>
                        </div>
                        {reviewCase.reviewComments && (
                          <div>
                            <p className="text-sm font-medium text-red-700">退回原因：</p>
                            <p className="text-sm text-red-600 line-clamp-2">
                              {reviewCase.reviewComments}
                            </p>
                          </div>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-xs mt-1 p-0 h-auto text-blue-600 hover:text-blue-800"
                          onClick={() => onViewDetailsReadOnly(reviewCase.id)}
                        >
                          查看完整內容
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          {filteredCases.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <p>沒有找到符合條件的案件</p>
            </div>
          )}
        </Tabs>
      </div>

      {/* 快速審核彈窗 */}
      <QuickReviewModal
        isOpen={isQuickReviewOpen}
        onClose={() => setIsQuickReviewOpen(false)}
        reviewCase={selectedCase}
        onApprove={(caseId, notes) => handleQuickReviewSubmit(caseId, 'approve', notes)}
        onReject={(caseId, notes) => handleQuickReviewSubmit(caseId, 'reject', notes)}
      />
    </div>
  );
}