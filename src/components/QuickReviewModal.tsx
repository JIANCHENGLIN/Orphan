import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";

export interface ReviewCase {
  id: string;
  caseNumber: string;
  recordId: string;
  applicantName: string;
  socialWorkerName: string;
  applicationDate: string;
  caseType: string;
  amount: string;
  status: 'pending' | 'approved' | 'rejected' | 'processing';
  serviceNotes?: string; // 社工員填寫的服務紀錄內容
  reviewComments?: string; // 督導審核意見
  reviewedAt?: string; // 審核完成時間
}

interface QuickReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  reviewCase: ReviewCase | null;
  onApprove: (caseId: string, notes: string) => void;
  onReject: (caseId: string, notes: string) => void;
}

export function QuickReviewModal({ 
  isOpen, 
  onClose, 
  reviewCase, 
  onApprove, 
  onReject 
}: QuickReviewModalProps) {
  const [reviewNotes, setReviewNotes] = useState('');

  if (!reviewCase) return null;

  const handleApprove = () => {
    if (!reviewNotes.trim()) return;
    
    onApprove(reviewCase.id, reviewNotes);
    
    // 重置表單
    setReviewNotes('');
    onClose();
  };

  const handleCancel = () => {
    setReviewNotes('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-2xl bg-white border-2 shadow-lg"
        style={{ borderColor: 'var(--color-review-field-border)' }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            ⚡ 快速審核
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 案件基本資訊 */}
          <div 
            className="p-4 rounded-lg border"
            style={{ 
              backgroundColor: 'var(--color-review-minor-bg)',
              borderColor: 'var(--color-review-field-border)'
            }}
          >
            <h3 className="font-medium mb-3">案件資訊</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">申請人：</span>
                <span className="font-medium">{reviewCase.applicantName}</span>
              </div>
              <div>
                <span className="text-gray-600">申請日期：</span>
                <span>{reviewCase.applicationDate}</span>
              </div>
              <div>
                <span className="text-gray-600">案件類型：</span>
                <span>{reviewCase.caseType}</span>
              </div>
              <div>
                <span className="text-gray-600">申請金額：</span>
                <span className="font-medium text-green-600">{reviewCase.amount}</span>
              </div>
            </div>
          </div>

          {/* 審核意見 */}
          <div className="space-y-3">
            <Label htmlFor="notes" className="text-base font-medium">
              審核意見 <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="notes"
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="請輸入審核意見或建議..."
              rows={4}
              className="resize-none"
              style={{ 
                backgroundColor: 'var(--color-review-field-bg)',
                borderColor: 'var(--color-review-field-border)'
              }}
            />
          </div>
        </div>

        {/* 操作按鈕 */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="review-button-cancel border-gray-300"
          >
            取消
          </Button>
          <Button
            onClick={handleApprove}
            disabled={!reviewNotes.trim()}
            className="review-button-approve"
          >
            核准
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}