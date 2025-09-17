import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { FileText, User, X, CheckCircle, XCircle, ClipboardCheck, AlertTriangle, Edit } from "lucide-react";

interface ServiceRecordViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseId: string;
  caseName: string;
  caseNumber: string;
  recordId?: string;
  status: 'approved' | 'rejected';
  reviewComments?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionCategories?: string[]; // 退回類別
  onEditRecord?: (recordId: string) => void; // 新增編輯功能回調
}

export function ServiceRecordViewModal({ 
  isOpen, 
  onClose, 
  caseId, 
  caseName, 
  caseNumber,
  recordId = 'S0077',
  status = 'approved',
  reviewComments = '經審核個案資料完整，評估合理，服務計劃具體可行。同意核准急難救助金，建議持續追蹤個案學習狀況及家庭經濟改善情形。',
  reviewedAt = '2024-09-17 15:30',
  reviewedBy = '李督導',
  rejectionCategories = ['data_error', 'need_supplementary'], // 預設退回類別
  onEditRecord
}: ServiceRecordViewModalProps) {
  
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
    
    // 社工員填寫的服務紀錄內容
    socialWorkerContent: `本次服務為個案家庭遭遇變故後的首次深度評估與服務。個案因家庭經濟狀況急遽變化，出現學習適應困難與情緒壓力。

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

個案需求評估：
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

  // 退回類別標籤對應
  const rejectionCategoryLabels: { [key: string]: string } = {
    'data_error': '資料錯誤',
    'incomplete_content': '內容不完整',
    'need_supplementary': '需要補充資料',
    'inappropriate_service': '服務不當',
    'policy_violation': '違反規定',
    'other': '其他'
  };

  // 取得所有退回類別選項
  const getAllRejectionCategories = () => [
    'data_error',
    'incomplete_content', 
    'need_supplementary',
    'inappropriate_service',
    'policy_violation'
  ];

  // 獲取審核結果顯示
  const getReviewResultDisplay = () => {
    if (status === 'approved') {
      return {
        icon: <CheckCircle className="w-5 h-5 text-green-600" />,
        text: '已核准',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      };
    } else {
      return {
        icon: <XCircle className="w-5 h-5 text-red-600" />,
        text: '已退回',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
      };
    }
  };

  const reviewResult = getReviewResultDisplay();
  const pageTitle = status === 'approved' ? '完整服務紀錄檢視 (已核准)' : '完整服務紀錄檢視 (已退回)';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[95vh] bg-white border-2 shadow-lg overflow-hidden p-0">
        {/* 頁面標題 - 固定 */}
        <div className="p-6 pb-4 border-b bg-white flex flex-row items-center justify-between">
          <DialogTitle className="flex items-center gap-2 text-xl">
            {reviewResult.icon}
            {pageTitle}
          </DialogTitle>
          <div className="flex items-center gap-2">
            {/* 更正按鈕 - 僅在已退回狀態顯示 */}
            {status === 'rejected' && onEditRecord && (
              <Button
                onClick={() => {
                  onEditRecord(recordId);
                  onClose();
                }}
                className="review-button-quick text-sm px-4 py-2 flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                更正
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* 可滑動的整個內容區域 */}
        <div className="flex-1 overflow-y-auto max-h-[calc(95vh-80px)]">
          <div className="p-6 space-y-6">
            
            {/* 1. 審核紀錄區塊 (最上方) - 根據狀態不同顯示 */}
            {status === 'rejected' ? (
              /* 已退回：退回資訊區塊 - 強化警示設計 */
              <Card className="border-2 border-red-500 shadow-md" style={{ backgroundColor: '#FFEBEE' }}>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3" style={{ color: '#1976D2' }}>
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                    <span className="text-lg">⚠️ 退回資訊</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* 執本退回資訊 */}
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-700">督導姓名：</span>
                      <span className="font-medium text-gray-900">{reviewedBy}</span>
                    </div>
                    <div>
                      <span className="text-gray-700">退回日期：</span>
                      <span className="text-gray-900">{reviewedAt}</span>
                    </div>
                    <div>
                      <span className="text-gray-700">審核狀態：</span>
                      <span className="flex items-center gap-1 text-red-600">
                        <XCircle className="w-4 h-4" />
                        <span>❌ 已退回</span>
                      </span>
                    </div>
                  </div>
                  
                  {/* 退回類別區塊 - 改進設計 */}
                  <div className="bg-white rounded-lg p-4 border border-red-300">
                    <div className="mb-4">
                      <h4 className="flex items-center gap-2 text-lg text-gray-800">
                        🏷️ 退回類別
                      </h4>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {getAllRejectionCategories().map((category) => {
                        const isSelected = rejectionCategories.includes(category);
                        return (
                          <div key={category} className="flex items-center gap-3">
                            <div className={`w-5 h-5 border-2 rounded-sm flex items-center justify-center ${
                              isSelected 
                                ? 'border-red-500 bg-red-500' 
                                : 'border-gray-400 bg-white'
                            }`}>
                              {isSelected && (
                                <CheckCircle className="w-3 h-3 text-white" />
                              )}
                            </div>
                            <span className={`text-sm ${
                              isSelected 
                                ? 'text-red-700' 
                                : 'text-gray-600'
                            }`}>
                              {rejectionCategoryLabels[category]}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* 督導建議區塊 - 強化設計 */}
                  <div className="bg-white rounded-lg p-4 border border-red-300">
                    <div className="mb-3">
                      <h4 className="flex items-center gap-2 text-lg" style={{ color: '#1976D2' }}>
                        💡 督導建議
                      </h4>
                    </div>
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="text-sm leading-relaxed text-gray-800 whitespace-pre-line">
                        {reviewComments}
                      </div>
                      <div className="mt-3 pt-3 border-t border-red-200">
                        <div className="text-xs text-red-600 italic flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          此內容為唯讀，無法編輯
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              /* 已核准：督導審核紀錄區塊 */
              <Card className={`${reviewResult.bgColor} ${reviewResult.borderColor} border-2`}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ClipboardCheck className="w-5 h-5" />
                    督導審核紀錄
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">督導姓名：</span>
                      <span className="font-medium">{reviewedBy}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">審核日期：</span>
                      <span>{reviewedAt}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">審核結果：</span>
                      <span className="flex items-center gap-1 font-medium">
                        {reviewResult.icon}
                        {reviewResult.text}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">審核類別：</span>
                      <span>服務內容適當</span>
                    </div>
                  </div>
                  
                  {/* 審核建議區塊 */}
                  <div className="mt-4">
                    <div className="mb-2">
                      <span className="text-sm text-gray-600">📝 審核建議：</span>
                    </div>
                    <div className="p-4 bg-white rounded-lg border border-gray-200">
                      <div className="text-sm leading-relaxed text-gray-700">
                        {reviewComments}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 2. 基本資訊區塊 (第二位置) */}
            <Card style={{ backgroundColor: 'var(--color-review-major-bg)' }}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  📊 基本資訊
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

            {/* 3. 社工員服務紀錄區塊 (第三位置) */}
            <Card style={{ backgroundColor: 'var(--color-review-medium-bg)' }}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="w-5 h-5" />
                  👨‍💼 社工員服務紀錄 {status === 'rejected' && '(原始提交內容)'}
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

          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}