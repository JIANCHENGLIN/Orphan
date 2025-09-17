import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { AlertTriangle } from "lucide-react";

interface RejectConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (rejectionData: RejectionData) => void;
  caseName?: string;
  caseId?: string;
}

export interface RejectionData {
  reason: string;
  categories: string[];
}

const rejectionCategories = [
  { id: 'data_error', label: '資料錯誤' },
  { id: 'incomplete_content', label: '內容不完整' },
  { id: 'policy_violation', label: '違反規定' },
  { id: 'need_supplementary', label: '需要補充資料' },
  { id: 'inappropriate_service', label: '服務不當' },
  { id: 'other', label: '其他' }
];

export function RejectConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  caseName, 
  caseId 
}: RejectConfirmModalProps) {
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleConfirm = () => {
    if (!rejectionReason.trim() || selectedCategories.length === 0) return;
    
    onConfirm({
      reason: rejectionReason.trim(),
      categories: selectedCategories
    });
    
    // 重置表單
    setRejectionReason('');
    setSelectedCategories([]);
    onClose();
  };

  const handleCancel = () => {
    setRejectionReason('');
    setSelectedCategories([]);
    onClose();
  };

  const isFormValid = rejectionReason.trim().length >= 20 && 
                     rejectionReason.trim().length <= 300 && 
                     selectedCategories.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="w-[95%] max-w-[500px] max-h-[90vh] md:w-[90%] md:max-w-[450px] md:max-h-[85vh] lg:max-w-[500px] lg:max-h-[80vh] bg-white border-2 shadow-lg overflow-y-auto"
        style={{ borderColor: 'var(--color-review-pending)' }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl text-red-600">
            <AlertTriangle className="w-6 h-6" />
            退回確認
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 警告提示 */}
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-red-800 mb-1">注意事項</p>
              <ul className="text-red-700 space-y-1">
                <li>• 退回後社工員將收到通知</li>
                <li>• 社工員可重新編輯並送審</li>
                <li>• 請詳細說明退回原因以協助改善</li>
              </ul>
            </div>
          </div>

          {/* 案件資訊 */}
          {(caseName || caseId) && (
            <div 
              className="p-4 rounded-lg border"
              style={{ 
                backgroundColor: 'var(--color-review-minor-bg)',
                borderColor: 'var(--color-review-field-border)'
              }}
            >
              <h3 className="font-medium mb-2">退回案件</h3>
              {caseId && <p className="text-sm text-gray-600">案件編號：{caseId}</p>}
              {caseName && <p className="text-sm text-gray-600">申請人：{caseName}</p>}
            </div>
          )}

          {/* 退回類別選擇 */}
          <div className="space-y-3">
            <Label className="text-base font-medium">
              退回類別 <span className="text-red-500">*</span>
              <span className="text-sm font-normal text-gray-600 ml-2">(可多選)</span>
            </Label>
            <div className="grid grid-cols-1 gap-3">
              {rejectionCategories.map((category) => {
                const isSelected = selectedCategories.includes(category.id);
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => handleCategoryToggle(category.id)}
                    className={`
                      w-full px-4 py-3 text-left rounded-lg border-2 transition-all duration-200 ease-in-out
                      ${isSelected 
                        ? 'bg-[#F9DB6D] border-[#000000] border-[3px] text-black hover:bg-[#FFE894]' 
                        : 'bg-white border-[#D9D9D9] text-black hover:bg-[#FFE894]'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{category.label}</span>
                      {isSelected && (
                        <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 退回原因 */}
          <div className="space-y-3">
            <Label htmlFor="rejection-reason" className="text-base font-medium">
              退回原因 <span className="text-red-500">*</span>
            </Label>
            <p className="text-sm text-gray-600">
              請詳細說明退回原因，以協助社工員改善服務紀錄
            </p>
            <Textarea
              id="rejection-reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="請詳細說明退回原因，例如：哪些資料需要修正、補充什麼內容、服務記錄的問題等..."
              rows={5}
              className="resize-none"
              style={{ 
                backgroundColor: 'var(--color-review-field-bg)',
                borderColor: rejectionReason.trim().length < 20 ? 'var(--color-review-pending)' : 'var(--color-review-field-border)'
              }}
              maxLength={300}
            />
            <div className="flex justify-between text-xs">
              <span className={`${
                rejectionReason.trim().length < 20 
                  ? 'text-red-500' 
                  : rejectionReason.trim().length > 300 
                    ? 'text-red-500' 
                    : 'text-gray-500'
              }`}>
                {rejectionReason.trim().length < 20 
                  ? `至少需要 ${20 - rejectionReason.trim().length} 字` 
                  : ''}
              </span>
              <span className={`${
                rejectionReason.trim().length > 300 ? 'text-red-500' : 'text-gray-500'
              }`}>
                {rejectionReason.length}/300 字
              </span>
            </div>
          </div>

          {/* 驗證提示 */}
          {!isFormValid && (rejectionReason || selectedCategories.length > 0) && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200">
              <p className="font-medium mb-1">請完成以下必填項目：</p>
              <ul className="space-y-1">
                {selectedCategories.length === 0 && <li>• 選擇至少一個退回類別</li>}
                {rejectionReason.trim().length < 20 && <li>• 退回原因至少需要20字</li>}
                {rejectionReason.trim().length > 300 && <li>• 退回原因不可超過300字</li>}
              </ul>
            </div>
          )}
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
            onClick={handleConfirm}
            disabled={!isFormValid}
            className="review-button-reject"
          >
            確認退回
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}