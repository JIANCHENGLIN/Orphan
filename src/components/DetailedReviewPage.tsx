import { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";
import { ArrowLeft, FileText, User, Calendar, DollarSign } from "lucide-react";

interface ServiceRecord {
  id: string;
  recordId: string;
  caseNumber: string;
  caseName: string;
  serviceDate: string;
  socialWorkerName: string;
  submittedAt: string;
  
  // 服務輸送內容
  economicAssistance: {
    type: string;
    amount: number;
    reason: string;
  } | null;
  serviceProgram: {
    type: string;
    content: string;
    duration: string;
  } | null;
  materialAssistance: {
    items: string;
    value: number;
  } | null;
  counseling: {
    type: string;
    sessions: number;
    notes: string;
  } | null;
  networkCooperation: {
    partners: string;
    cooperation: string;
  } | null;
  
  // 個案需求評估
  assessment: {
    economic: string;
    health: string;
    academic: string;
    career: string;
    interpersonal: string;
    faith: string;
  };
  
  // 處遇計劃
  treatmentPlan: {
    shortTerm: string;
    longTerm: string;
    resources: string;
    followUp: string;
  };
  
  // 服務紀錄內容
  serviceNotes: string;
}

interface DetailedReviewPageProps {
  serviceRecord: ServiceRecord;
  onBack: () => void;
  onApprove: (reviewData: ReviewData) => void;
  onReject: (reviewData: ReviewData) => void;
  onSaveDraft: (reviewData: ReviewData) => void;
}

interface ReviewData {
  reviewCategories: string[];
  supervisorSuggestion: string;
}

const reviewCategoryOptions = [
  { id: 'content_appropriate', label: '服務內容適當' },
  { id: 'need_explanation', label: '需要補充說明' },
  { id: 'need_correction', label: '資料需修正' },
  { id: 'other', label: '其他' }
];

export function DetailedReviewPage({ 
  serviceRecord, 
  onBack, 
  onApprove, 
  onReject, 
  onSaveDraft 
}: DetailedReviewPageProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [supervisorSuggestion, setSupervisorSuggestion] = useState('');

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories(prev => [...prev, categoryId]);
    } else {
      setSelectedCategories(prev => prev.filter(id => id !== categoryId));
    }
  };

  const getReviewData = (): ReviewData => ({
    reviewCategories: selectedCategories,
    supervisorSuggestion
  });

  const handleApprove = () => {
    onApprove(getReviewData());
  };

  const handleReject = () => {
    onReject(getReviewData());
  };

  const handleSaveDraft = () => {
    onSaveDraft(getReviewData());
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 頁面標題列 */}
      <div 
        className="sticky top-0 z-10 bg-white border-b shadow-sm"
        style={{ borderColor: 'var(--color-review-field-border)' }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                返回列表
              </Button>
              <div>
                <h1 className="text-xl font-bold">詳細審核</h1>
                <p className="text-sm text-gray-600">紀錄表編號：{serviceRecord.recordId}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleSaveDraft}>
                儲存草稿
              </Button>
              <Button 
                onClick={handleReject}
                className="review-button-reject"
              >
                退回
              </Button>
              <Button 
                onClick={handleApprove}
                className="review-button-approve"
              >
                核准
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* 服務紀錄資訊區 (唯讀) */}
        <Card>
          <CardHeader 
            style={{ backgroundColor: 'var(--color-review-major-bg)' }}
          >
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              服務紀錄資訊
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <Label className="text-sm text-gray-600">個案編號</Label>
                <p className="font-medium" style={{ color: 'var(--color-review-link-color)' }}>
                  {serviceRecord.caseNumber}
                </p>
              </div>
              <div>
                <Label className="text-sm text-gray-600">個案姓名</Label>
                <p className="font-medium">{serviceRecord.caseName}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-600">服務日期</Label>
                <p className="font-medium">{serviceRecord.serviceDate}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-600">紀錄表編號</Label>
                <p className="font-medium" style={{ color: 'var(--color-review-link-color)' }}>
                  {serviceRecord.recordId}
                </p>
              </div>
              <div>
                <Label className="text-sm text-gray-600">社工員姓名</Label>
                <p className="font-medium">{serviceRecord.socialWorkerName}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-600">送審時間</Label>
                <p className="font-medium">{serviceRecord.submittedAt}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 社工員服務紀錄內容區 (唯讀) */}
        <Card>
          <CardHeader 
            style={{ backgroundColor: 'var(--color-review-medium-bg)' }}
          >
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              社工員服務紀錄內容
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* 服務輸送 */}
            <div>
              <h3 className="font-medium mb-4">服務輸送</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {serviceRecord.economicAssistance && (
                  <div 
                    className="p-4 rounded border"
                    style={{ 
                      backgroundColor: 'var(--color-review-minor-bg)',
                      borderColor: 'var(--color-review-field-border)'
                    }}
                  >
                    <h4 className="font-medium text-sm mb-2">經濟扶助</h4>
                    <p className="text-sm text-gray-600">類型：{serviceRecord.economicAssistance.type}</p>
                    <p className="text-sm text-gray-600">金額：NT$ {serviceRecord.economicAssistance.amount.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">原因：{serviceRecord.economicAssistance.reason}</p>
                  </div>
                )}
                
                {serviceRecord.serviceProgram && (
                  <div 
                    className="p-4 rounded border"
                    style={{ 
                      backgroundColor: 'var(--color-review-minor-bg)',
                      borderColor: 'var(--color-review-field-border)'
                    }}
                  >
                    <h4 className="font-medium text-sm mb-2">服務方案</h4>
                    <p className="text-sm text-gray-600">類型：{serviceRecord.serviceProgram.type}</p>
                    <p className="text-sm text-gray-600">內容：{serviceRecord.serviceProgram.content}</p>
                    <p className="text-sm text-gray-600">期程：{serviceRecord.serviceProgram.duration}</p>
                  </div>
                )}
                
                {serviceRecord.materialAssistance && (
                  <div 
                    className="p-4 rounded border"
                    style={{ 
                      backgroundColor: 'var(--color-review-minor-bg)',
                      borderColor: 'var(--color-review-field-border)'
                    }}
                  >
                    <h4 className="font-medium text-sm mb-2">物資扶助</h4>
                    <p className="text-sm text-gray-600">項目：{serviceRecord.materialAssistance.items}</p>
                    <p className="text-sm text-gray-600">價值：NT$ {serviceRecord.materialAssistance.value.toLocaleString()}</p>
                  </div>
                )}
                
                {serviceRecord.counseling && (
                  <div 
                    className="p-4 rounded border"
                    style={{ 
                      backgroundColor: 'var(--color-review-minor-bg)',
                      borderColor: 'var(--color-review-field-border)'
                    }}
                  >
                    <h4 className="font-medium text-sm mb-2">心理諮商</h4>
                    <p className="text-sm text-gray-600">類型：{serviceRecord.counseling.type}</p>
                    <p className="text-sm text-gray-600">次數：{serviceRecord.counseling.sessions}</p>
                    <p className="text-sm text-gray-600">備註：{serviceRecord.counseling.notes}</p>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* 個案需求評估 */}
            <div>
              <h3 className="font-medium mb-4">個案需求評估</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">經濟現況</Label>
                  <p className="text-sm text-gray-700 mt-1">{serviceRecord.assessment.economic}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">健康現況</Label>
                  <p className="text-sm text-gray-700 mt-1">{serviceRecord.assessment.health}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">課業現況</Label>
                  <p className="text-sm text-gray-700 mt-1">{serviceRecord.assessment.academic}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">職涯發展</Label>
                  <p className="text-sm text-gray-700 mt-1">{serviceRecord.assessment.career}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">人際互動</Label>
                  <p className="text-sm text-gray-700 mt-1">{serviceRecord.assessment.interpersonal}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">信仰面向</Label>
                  <p className="text-sm text-gray-700 mt-1">{serviceRecord.assessment.faith}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* 處遇計劃 */}
            <div>
              <h3 className="font-medium mb-4">處遇計劃</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">短期目標</Label>
                  <p className="text-sm text-gray-700 mt-1">{serviceRecord.treatmentPlan.shortTerm}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">長期目標</Label>
                  <p className="text-sm text-gray-700 mt-1">{serviceRecord.treatmentPlan.longTerm}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">資源連結</Label>
                  <p className="text-sm text-gray-700 mt-1">{serviceRecord.treatmentPlan.resources}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">後續追蹤</Label>
                  <p className="text-sm text-gray-700 mt-1">{serviceRecord.treatmentPlan.followUp}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* 服務紀錄內容 */}
            <div>
              <h3 className="font-medium mb-4">服務紀錄內容</h3>
              <div 
                className="p-4 rounded border min-h-[120px]"
                style={{ 
                  backgroundColor: 'var(--color-review-field-bg)',
                  borderColor: 'var(--color-review-field-border)'
                }}
              >
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {serviceRecord.serviceNotes}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 督導審核紀錄區 (填寫) */}
        <Card>
          <CardHeader 
            style={{ backgroundColor: 'var(--color-review-major-bg)' }}
          >
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              督導審核紀錄
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* 審核類別選擇 */}
            <div>
              <Label className="text-base font-medium mb-4 block">審核類別（可複選）</Label>
              <div className="grid grid-cols-2 gap-4">
                {reviewCategoryOptions.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={option.id}
                      checked={selectedCategories.includes(option.id)}
                      onCheckedChange={(checked) => 
                        handleCategoryChange(option.id, checked as boolean)
                      }
                    />
                    <Label htmlFor={option.id} className="cursor-pointer">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* 督導建議 */}
            <div>
              <Label htmlFor="supervisor-suggestion" className="text-base font-medium mb-2 block">
                督導建議
              </Label>
              <p className="text-sm text-gray-600 mb-3">
                請填寫後續服務建議、注意事項、專業指導意見等（建議填寫，非必填）
              </p>
              <Textarea
                id="supervisor-suggestion"
                value={supervisorSuggestion}
                onChange={(e) => setSupervisorSuggestion(e.target.value)}
                placeholder="請輸入督導建議..."
                rows={6}
                className="resize-none"
                style={{ 
                  backgroundColor: 'var(--color-review-field-bg)',
                  borderColor: 'var(--color-review-field-border)'
                }}
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">
                {supervisorSuggestion.length}/500 字
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 操作按鈕區 */}
        <div className="flex justify-end gap-3 pb-8">
          <Button variant="outline" onClick={onBack}>
            取消
          </Button>
          <Button variant="outline" onClick={handleSaveDraft}>
            儲存草稿
          </Button>
          <Button 
            onClick={handleReject}
            className="review-button-reject"
          >
            退回
          </Button>
          <Button 
            onClick={handleApprove}
            className="review-button-approve"
          >
            核准
          </Button>
        </div>
      </div>
    </div>
  );
}