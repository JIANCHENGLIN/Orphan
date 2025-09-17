import { useState, useEffect, useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { ScrollArea } from "./ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { FileText, User, X, CheckCircle, XCircle, AlertTriangle, Save, Loader2, WifiOff, Clock } from "lucide-react";

interface ServiceRecordDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseId: string;
  caseName: string;
  caseNumber: string;
  recordId?: string;
  onQuickReview?: (caseId: string, decision: 'approve' | 'reject', notes: string) => void;
  onRejectCase?: (caseId: string, notes: string) => void;
  onSaveToQuickReview?: (caseId: string, notes: string) => void;
  onSaveToReject?: (caseId: string, notes: string) => void;
}

// 草稿資料結構
interface DraftData {
  recordId: string;
  content: string;
  updatedAt: string;
}

// 儲存狀態類型
type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error' | 'loaded-draft';

export function ServiceRecordDetailModal({ 
  isOpen, 
  onClose, 
  caseId, 
  caseName, 
  caseNumber,
  recordId = 'S0077',
  onQuickReview,
  onRejectCase,
  onSaveToQuickReview,
  onSaveToReject
}: ServiceRecordDetailModalProps) {
  const [reviewComments, setReviewComments] = useState('');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('unsaved');
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  
  // 計時器 refs
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);
  const intervalTimer = useRef<NodeJS.Timeout | null>(null);
  const isInitialLoad = useRef(true);
  const reviewCommentsRef = useRef('');
  
  // 模擬完整的服務紀錄內容
  const serviceRecord = {
    basicInfo: {
      recordId: recordId,
      caseId: `${caseNumber}|${recordId}`,
      caseNumber: caseNumber,
      caseName: caseName,
      serviceDate: '2024-09-15 14:30',
      socialWorkerName: '陳社工',
      submittedAt: '2024-09-15 17:45'
    },
    
    // 簡化的社工員填寫內容 - 加入「示範」
    socialWorkerContent: `示範

本次服務為個案家庭遭遇變故後的首次深度評估與服務。個案因家庭經濟狀況急遽變化，出現學習適應困難與情緒壓力。

服務過程：
1. 進行詳細的家庭經濟狀況評估，確認急難救助的必要性
2. 與個案進行深度會談，了解其內心感受與需求
3. 安排心理諮商，協助處理情緒壓力
4. 連結學校資源，提供課業輔導支持
5. 建立後續追蹤計劃

個案回應積極，願意配合各項服務安排。家庭成員對於接受協助態度開放，有助於服務執行。建議持續關注個案適應狀況，適時調整服務內容。

服務輸送內容包含：
- 經濟協助：急難救助金 NT$ 15,000，因家庭經濟困難急需資金支援學費
- 服務方案：課業輔導 - 國中數學、英文課業輔導，每週二次每次2小時持續3個月
- 諮商輔導：個別諮商4次，協助個案處理家庭變故帶來的情緒壓力
- 網絡合作：與學校輔導室合作關注個案學習狀況

個需求評估：
- 經濟狀況：家庭主要收入來源中斷，目前依靠親戚接濟維生，經濟狀況困難
- 健康狀況：個案身體健康狀況良好，無重大疾病
- 學業狀況：學業成績中等，因家庭狀況影響學習專注度
- 職涯發展：國中階段，尚未有具體職涯規劃
- 人際關係：個性內向，與同儕關係普通，較依賴家人

處遇計劃：
- 短期目標：提供急難救助金協助度過經濟難關，安排課業輔導提升學習成效
- 長期目標：協助個案建立自信心，培養獨立能力，規劃升學方向
- 資源連結：連結教育資源、心理諮商資源、社區支持系統
- 後續追蹤：每月進行訪視，關注學習狀況及情緒變化，必要時調整服務計劃`
  };

  // 實際草稿 API 呼叫（使用 localStorage）
  const mockDraftApi = {
    // 載入草稿
    loadDraft: async (recordId: string): Promise<DraftData | null> => {
      return new Promise((resolve) => {
        setTimeout(() => {
          try {
            const draftKey = `review_draft_${recordId}`;
            const savedDraft = localStorage.getItem(draftKey);
            
            if (savedDraft) {
              const draftData = JSON.parse(savedDraft);
              resolve(draftData);
            } else {
              resolve(null);
            }
          } catch (error) {
            console.error('載入草稿失敗:', error);
            resolve(null);
          }
        }, 300);
      });
    },
    
    // 儲存草稿
    saveDraft: async (recordId: string, content: string): Promise<boolean> => {
      return new Promise((resolve) => {
        setTimeout(() => {
          try {
            const draftKey = `review_draft_${recordId}`;
            const draftData: DraftData = {
              recordId,
              content,
              updatedAt: new Date().toISOString()
            };
            
            localStorage.setItem(draftKey, JSON.stringify(draftData));
            resolve(true);
          } catch (error) {
            console.error('儲存草稿失敗:', error);
            resolve(false);
          }
        }, Math.random() * 500 + 300);
      });
    },
    
    // 刪除草稿
    deleteDraft: async (recordId: string): Promise<boolean> => {
      return new Promise((resolve) => {
        setTimeout(() => {
          try {
            const draftKey = `review_draft_${recordId}`;
            localStorage.removeItem(draftKey);
            resolve(true);
          } catch (error) {
            console.error('刪除草稿失敗:', error);
            resolve(false);
          }
        }, 200);
      });
    }
  };

  // 自動儲存函數 - 移除對reviewComments的依賴，改為接收參數
  const saveDraft = useCallback(async (content: string) => {
    if (!content.trim()) return;
    
    setSaveStatus('saving');
    
    try {
      const success = await mockDraftApi.saveDraft(recordId, content);
      if (success) {
        setSaveStatus('saved');
        setLastSavedTime(new Date());
      } else {
        setSaveStatus('error');
      }
    } catch (error) {
      setSaveStatus('error');
    }
  }, [recordId]);

  // 清除計時器
  const clearTimers = useCallback(() => {
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = null;
    }
    if (intervalTimer.current) {
      clearInterval(intervalTimer.current);
      intervalTimer.current = null;
    }
  }, []);

  // 審核建議變更處理
  const handleReviewCommentsChange = (value: string) => {
    setReviewComments(value);
    reviewCommentsRef.current = value; // 同步更新ref
    
    // 如果是初始載入，不要標記為未儲存
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }
    
    setSaveStatus('unsaved');
    
    // 清除之前的計時器
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
    }
    
    // 3秒後自動儲存 - 傳遞當前值
    autoSaveTimer.current = setTimeout(() => {
      saveDraft(value);
    }, 3000);
  };

  // 輸入框失焦處理
  const handleTextareaBlur = () => {
    if (reviewComments.trim() && saveStatus === 'unsaved') {
      saveDraft(reviewComments);
    }
  };

  // 格式化時間差
  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return '剛剛';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}分鐘前`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}小時前`;
    return `${Math.floor(diffInSeconds / 86400)}天前`;
  };

  // 渲染儲存狀態指示器
  const renderSaveStatus = () => {
    switch (saveStatus) {
      case 'saving':
        return (
          <div className="flex items-center gap-1 text-blue-600 text-xs">
            <Loader2 className="w-3 h-3 animate-spin" />
            儲存中...
          </div>
        );
      case 'saved':
        return (
          <div className="flex items-center gap-1 text-green-600 text-xs">
            <Save className="w-3 h-3" />
            已儲存 {lastSavedTime && `(${formatTimeAgo(lastSavedTime)})`}
          </div>
        );
      case 'loaded-draft':
        return (
          <div className="flex items-center gap-1 text-blue-600 text-xs">
            <Save className="w-3 h-3" />
            已載入草稿 {lastSavedTime && `(最後編輯：${formatTimeAgo(lastSavedTime)})`}
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center gap-1 text-red-600 text-xs">
            <WifiOff className="w-3 h-3" />
            儲存失敗
          </div>
        );
      case 'unsaved':
        return (
          <div className="flex items-center gap-1 text-orange-600 text-xs">
            <Clock className="w-3 h-3" />
            未儲存
          </div>
        );
      default:
        return null;
    }
  };

  // 頁面開啟時載入草稿
  useEffect(() => {
    if (isOpen) {
      // 重置狀態
      isInitialLoad.current = true;
      
      const loadDraft = async () => {
        try {
          const draft = await mockDraftApi.loadDraft(recordId);
          if (draft) {
            // 直接自動載入草稿，不顯示彈窗
            setReviewComments(draft.content);
            reviewCommentsRef.current = draft.content; // 同步更新ref
            setSaveStatus('loaded-draft');
            setLastSavedTime(new Date(draft.updatedAt));
          } else {
            // 沒有草稿，顯示空白表單
            setReviewComments('');
            reviewCommentsRef.current = ''; // 同步更新ref
            setSaveStatus('unsaved');
          }
        } catch (error) {
          console.error('載入草稿失敗:', error);
        }
      };
      
      loadDraft();
      
      // 開始定時儲存
      intervalTimer.current = setInterval(() => {
        // 使用 ref 來獲取當前的 reviewComments 值
        if (reviewCommentsRef.current.trim()) {
          saveDraft(reviewCommentsRef.current);
        }
      }, 30000); // 30秒
    } else {
      // 關閉時重置狀態
      setReviewComments('');
      setSaveStatus('unsaved');
      setLastSavedTime(null);
    }
    
    return () => {
      clearTimers();
    };
  }, [isOpen, recordId, saveDraft, clearTimers]); // 移除 reviewComments 依賴

  // 關閉處理
  const handleCloseClick = async () => {
    // 如果有內容，先儲存一次
    if (reviewComments.trim()) {
      await saveDraft(reviewComments);
      setShowExitConfirm(true);
    } else {
      onClose();
    }
  };

  const handleConfirmExit = () => {
    setShowExitConfirm(false);
    clearTimers();
    onClose();
  };

  const handleContinueEditing = () => {
    setShowExitConfirm(false);
  };

  // 核准處理
  const handleApprove = async () => {
    if (onQuickReview) {
      onQuickReview(caseId, 'approve', reviewComments);
    }
    // 清除草稿
    await mockDraftApi.deleteDraft(recordId);
    clearTimers();
    onClose();
  };

  // 退回處理
  const handleReject = async () => {
    if (onRejectCase) {
      onRejectCase(caseId, reviewComments);
    }
    // 清除草稿
    await mockDraftApi.deleteDraft(recordId);
    clearTimers();
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={() => {}}>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[95vh] bg-white border-2 shadow-lg overflow-hidden p-0">
          {/* 頁面標題 - 固定 */}
          <div className="p-6 pb-4 border-b bg-white flex flex-row items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <FileText className="w-6 h-6" />
              完整服務紀錄檢視
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCloseClick}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* 可滑動的整個內容區域 */}
          <div className="flex-1 overflow-y-auto max-h-[calc(95vh-80px)]">
            <div className="p-6 space-y-6">
              {/* 執本資訊區塊 */}
              <Card style={{ backgroundColor: 'var(--color-review-minor-bg)' }}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    執本資訊
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">紀錄編號：</span>
                      <span className="font-mono" style={{ color: 'var(--color-review-link-color)' }}>
                        {serviceRecord.basicInfo.caseId}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">個案編號：</span>
                      <span className="font-mono" style={{ color: 'var(--color-review-link-color)' }}>
                        {serviceRecord.basicInfo.caseNumber}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">個案姓名：</span>
                      <span className="font-medium">{serviceRecord.basicInfo.caseName}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">社工員：</span>
                      <span>{serviceRecord.basicInfo.socialWorkerName}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">服務日期：</span>
                      <span>{serviceRecord.basicInfo.serviceDate}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">提交時間：</span>
                      <span>{serviceRecord.basicInfo.submittedAt}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 社工員服務紀錄區塊 */}
              <Card style={{ backgroundColor: 'var(--color-review-medium-bg)' }}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="w-5 h-5" />
                    社工員服務紀錄
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* 完整的社工員填寫內容 */}
                  <div className="p-4 bg-white rounded-lg border border-gray-200">
                    <div className="text-sm whitespace-pre-line leading-relaxed">
                      {serviceRecord.socialWorkerContent}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 審核功能區塊 */}
              <div className="pt-4 border-t bg-white">
                <div className="space-y-4">
                  <div className="relative">
                    <div className="flex justify-between items-center mb-2">
                      <Label className="text-base font-medium">審核建議</Label>
                      <div className="absolute top-0 right-0">
                        {renderSaveStatus()}
                      </div>
                    </div>
                    <Textarea
                      value={reviewComments}
                      onChange={(e) => handleReviewCommentsChange(e.target.value)}
                      onBlur={handleTextareaBlur}
                      placeholder="請輸入您的審核建議、意見或指導..."
                      rows={3}
                      className="mt-2 resize-none"
                      style={{ 
                        backgroundColor: 'var(--color-review-field-bg)',
                        borderColor: 'var(--color-review-field-border)'
                      }}
                    />
                  </div>

                  {/* 審核按鈕 */}
                  <div className="flex justify-center gap-4 pb-6">
                    <Button
                      onClick={handleApprove}
                      className="review-button-approve flex items-center gap-2 px-8"
                      disabled={!reviewComments.trim()}
                    >
                      <CheckCircle className="w-4 h-4" />
                      核准
                    </Button>
                    <Button
                      onClick={handleReject}
                      className="review-button-reject flex items-center gap-2 px-8"
                      disabled={!reviewComments.trim()}
                    >
                      <XCircle className="w-4 h-4" />
                      退回
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 簡化的退出確認彈窗 */}
      <AlertDialog open={showExitConfirm} onOpenChange={setShowExitConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              ⚠️ 確認離開
            </AlertDialogTitle>
            <AlertDialogDescription>
              您填寫的審核建議已自動儲存為草稿<br />
              下次開啟時可以繼續編輯
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleContinueEditing}>
              繼續編輯
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmExit}>
              確認離開
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}