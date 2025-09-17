import { useState } from 'react';
import { ReviewHeader } from './components/ReviewHeader';
import { ReviewTable } from './components/ReviewTable';
import { DetailedReviewPage } from './components/DetailedReviewPage';
import { RejectConfirmModal, type RejectionData } from './components/RejectConfirmModal';
import { SocialWorkerDashboard } from './components/SocialWorkerDashboard';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';

import { ServiceRecordDetailModal } from './components/ServiceRecordDetailModal';
import { ServiceRecordViewModal } from './components/ServiceRecordViewModal';
import { type ReviewCase } from './components/QuickReviewModal';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner@2.0.3';

// 擴展模擬資料，包含更詳細的服務紀錄資訊
interface ExtendedServiceRecord {
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
  
  // 案需求評估
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

// 模擬案件資料
const mockCases: ReviewCase[] = [
  {
    id: 'REV20240901001',
    caseNumber: 'B0500537',
    recordId: 'S0077',
    applicantName: '王小明',
    socialWorkerName: '陳社工',
    applicationDate: '2024-09-15',
    caseType: '急難救助金',
    amount: 'NT$ 15,000',
    status: 'pending'
  },
  {
    id: 'REV20240901002',
    caseNumber: 'B0400448',
    recordId: 'S0029',
    applicantName: '李美華',
    socialWorkerName: '林社工',
    applicationDate: '2024-09-14',
    caseType: '教育助學金',
    amount: 'NT$ 8,000',
    status: 'pending'
  },
  {
    id: 'REV20240901003',
    caseNumber: 'B0600515',
    recordId: 'S0045',
    applicantName: '陳志強',
    socialWorkerName: '張社工',
    applicationDate: '2024-09-13',
    caseType: '生活補助金',
    amount: 'NT$ 12,000',
    status: 'approved',
    serviceNotes: '個案因家庭經濟困難申請生活補助。經訪視評估，家庭確實面臨經濟壓力，父親失業中，母親工作收入不穩定。個案學習表現良好，積極參與學校活動。提供生活補助金協助度過困難期，並連結就業服務資源協助父親求職。',
    reviewComments: '經審核個案資料完整，評估合理，服務計劃具體可行。同意核准生活補助金，建議持續追蹤家庭經濟狀況改善情形。',
    reviewedAt: '2024-09-14 10:30'
  },
  {
    id: 'REV20240901004',
    caseNumber: 'B0300762',
    recordId: 'S0062',
    applicantName: '張淑芬',
    socialWorkerName: '王社工',
    applicationDate: '2024-09-12',
    caseType: '醫療補助金',
    amount: 'NT$ 25,000',
    status: 'rejected',
    serviceNotes: '個案因慢性疾病需長期治療，申請醫療補助金。個案有固定就醫習慣，醫療費用負擔沉重。家庭收入雖不高但尚可維持基本生活，主要困難在於醫療支出。',
    reviewComments: '建議重新核對服務紀錄，確保資料正確性。個案經濟狀況評估需要提供更詳細的文件佐證，請補充家庭收支明細表。處遇計劃的時程安排請更具體明確，建議加入階段性目標設定。',
    reviewedAt: '2024-09-13 14:15'
  },
  {
    id: 'REV20240901005',
    caseNumber: 'B0700239',
    recordId: 'S0024',
    applicantName: '劉建國',
    socialWorkerName: '李社工',
    applicationDate: '2024-09-11',
    caseType: '急難救助金',
    amount: 'NT$ 18,000',
    status: 'pending'
  },
  {
    id: 'REV20240901006',
    caseNumber: 'B0450891',
    recordId: 'S0038',
    applicantName: '黃麗娟',
    socialWorkerName: '陳社工',  
    applicationDate: '2024-09-10',
    caseType: '職業訓練補助',
    amount: 'NT$ 20,000',
    status: 'approved',
    serviceNotes: '個案高中畢業後一直待業，希望學習專業技能增加就業機會。經評估個案學習動機強，選擇美容美髮職訓課程，課程內容實用且就業前景良好。家庭支持個案參與訓練，並願意協助交通等相關費用。',
    reviewComments: '個案職涯規劃明確，所選擇的職訓課程符合市場需求。家庭支持度高，完訓後就業機會佳。同意核准職業訓練補助，期待個案順利完成訓練並成功就業。',
    reviewedAt: '2024-09-11 09:45'
  },
  {
    id: 'REV20240901007',
    caseNumber: 'B0380624',
    recordId: 'S0051',
    applicantName: '吳大雄',
    socialWorkerName: '林社工',
    applicationDate: '2024-09-09',
    caseType: '生活補助金',
    amount: 'NT$ 10,000',
    status: 'approved',
    serviceNotes: '個案單親爸爸，獨自照顧兩名子女。近期因工作異動收入不穩定，生活開支緊張。個案工作態度認真，正積極尋找穩定工作。子女學習狀況良好，個案照顧能力佳。申請短生活補助度過轉職過渡期。',
    reviewComments: '個案照顧責任重大，工作轉換期間確實需要支持。評估個案具備工作能力且積極求職，核准短期生活補助合理。建議同時連結就業服務資源，協助儘快找到穩定工作。',
    reviewedAt: '2024-09-10 16:20'
  },
  {
    id: 'REV20240901008',
    caseNumber: 'B0520173',
    recordId: 'S0015',
    applicantName: '林小琪',
    socialWorkerName: '張社工',
    applicationDate: '2024-09-08',
    caseType: '教育助學金',
    amount: 'NT$ 6,000',
    status: 'pending'
  }
];

// 模擬詳細服務紀錄資料
const mockServiceRecord: ExtendedServiceRecord = {
  id: 'REV20240901001',
  recordId: 'R20240915001',
  caseNumber: 'C2024001',
  caseName: '王小明',
  serviceDate: '2024-09-15 14:30',
  socialWorkerName: '陳社工',
  submittedAt: '2024-09-15 17:45',
  
  economicAssistance: {
    type: '急難救助金',
    amount: 15000,
    reason: '家庭經濟困難，急需資金支援學費'
  },
  serviceProgram: {
    type: '課業輔導',
    content: '國中數學、英文課業輔導',
    duration: '每週二次，每次2小時，持續3個月'
  },
  materialAssistance: null,
  counseling: {
    type: '個別諮商',
    sessions: 4,
    notes: '協助個案處理家庭變故帶來的情緒壓力'
  },
  networkCooperation: {
    partners: '學校輔導室',
    cooperation: '與學校合作關注個案學習狀況'
  },
  
  assessment: {
    economic: '家庭主要收入來源中斷，目前依靠親戚接濟維生，經濟狀況困難',
    health: '個案身體健康狀況良好，無重大疾病',
    academic: '學業成績中等，因家庭狀況影響學習專注度',
    career: '國中階段，尚未有具體職涯規劃',
    interpersonal: '個性內向，與同儕關係普通，較依賴家人',
    faith: '家庭無特定宗教信仰'
  },
  
  treatmentPlan: {
    shortTerm: '提供急難救助金協助度過經濟難關，安排課業輔導提升學習成效',
    longTerm: '協助個案建立自信心，培養獨立能力，規劃升學方向',
    resources: '連教育資源、心理諮商資源、社區支持系統',
    followUp: '每月進行訪視，關注學習狀況及情緒變化，必要時調整服務計劃'
  },
  
  serviceNotes: `本次服務為個案家庭遭遇變故後的首次深度評估與服務。個案因家庭經濟狀況急遽變化，出現學習適應困難與情緒压力。

服務過程：
1. 進行詳細的家庭經濟狀況評估，確認急難救助的必要性
2. 與個案進行深度會談，了解其內心感受與需求
3. 安排心理諮商，協助處理情緒壓力
4. 連結學校資源，提供課業輔導支持
5. 建立後續追蹤計劃

個案回應積極，願意配合各項服務安排。家庭成員對於接受協助態度開放，有助於服務執行。建議持續關注個案適應狀況，適時調整服務內容。`
};

type AppView = 'supervisor' | 'detailed-review' | 'social-worker';

export default function App() {
  const [cases, setCases] = useState<ReviewCase[]>(mockCases);
  const [currentView, setCurrentView] = useState<AppView>('supervisor');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedCaseForReject, setSelectedCaseForReject] = useState<ReviewCase | null>(null);
  const [isServiceRecordModalOpen, setIsServiceRecordModalOpen] = useState(false);
  const [isServiceRecordViewModalOpen, setIsServiceRecordViewModalOpen] = useState(false);
  const [selectedCaseForDetail, setSelectedCaseForDetail] = useState<ReviewCase | null>(null);
  const [selectedCaseForView, setSelectedCaseForView] = useState<ReviewCase | null>(null);
  const supervisorName = '張督導';
  const socialWorkerName = '陳社工';
  const notificationCount = cases.filter(c => c.status === 'pending').length;

  const handleQuickReview = (caseId: string, decision: 'approve' | 'reject', notes: string) => {
    if (decision === 'reject') {
      // 對於快速審核的退回，直接處理
      setCases(prevCases => 
        prevCases.map(reviewCase => 
          reviewCase.id === caseId 
            ? { ...reviewCase, status: 'rejected' }
            : reviewCase
        )
      );
      
      const reviewCase = cases.find(c => c.id === caseId);
      if (reviewCase) {
        toast.error(`案件 ${caseId} 已退回`, {
          description: `申請人：${reviewCase.applicantName}，退回原因：${notes}`
        });
      }
    } else {
      setCases(prevCases => 
        prevCases.map(reviewCase => 
          reviewCase.id === caseId 
            ? { ...reviewCase, status: 'approved' }
            : reviewCase
        )
      );

      const reviewCase = cases.find(c => c.id === caseId);
      if (reviewCase) {
        toast.success(`案件 ${caseId} 已核准`, {
          description: `申請人：${reviewCase.applicantName}，金額：${reviewCase.amount}`
        });
      }
    }
  };

  const handleDetailedReview = (caseId: string) => {
    setCurrentView('detailed-review');
    toast.info(`開啟詳細審核`, {
      description: `案件 ${caseId}`
    });
  };

  const handleViewDetails = (caseId: string) => {
    const reviewCase = cases.find(c => c.id === caseId);
    if (reviewCase) {
      setSelectedCaseForDetail(reviewCase);
      setIsServiceRecordModalOpen(true);
    }
  };

  const handleViewDetailsReadOnly = (caseId: string) => {
    const reviewCase = cases.find(c => c.id === caseId);
    if (reviewCase) {
      setSelectedCaseForView(reviewCase);
      setIsServiceRecordViewModalOpen(true);
    }
  }; 

  const handleDetailedApprove = (reviewData: any) => {
    // 處理詳細審核的核准
    toast.success('案件已核准', {
      description: '已完詳細審核並核准案件'
    });
    setCurrentView('supervisor');
  };

  const handleDetailedReject = (reviewData: any) => {
    // 開啟退回確認彈窗
    setSelectedCaseForReject(cases.find(c => c.id === mockServiceRecord.id) || null);
    setIsRejectModalOpen(true);
  };

  const handleDetailedSaveDraft = (reviewData: any) => {
    toast.info('草稿已儲存', {
      description: '審核資料已暫存，可稍後繼續編輯'
    });
  };

  const handleConfirmReject = (rejectionData: RejectionData) => {
    if (selectedCaseForReject) {
      setCases(prevCases => 
        prevCases.map(reviewCase => 
          reviewCase.id === selectedCaseForReject.id 
            ? { ...reviewCase, status: 'rejected' }
            : reviewCase
        )
      );

      // 轉換退回類別為中文標籤
      const categoryLabels: { [key: string]: string } = {
        'data_error': '資料錯誤',
        'incomplete_content': '內容不完整',
        'policy_violation': '違反規定',
        'need_supplementary': '需要補充資料',
        'inappropriate_service': '服務不當',
        'other': '其他'
      };

      const selectedLabels = rejectionData.categories.map(cat => categoryLabels[cat] || cat).join('、');

      toast.error(`案件 ${selectedCaseForReject.id} 已退回`, {
        description: `退回類別：${selectedLabels}`,
        duration: 5000
      });
    }
    setCurrentView('supervisor');
    setIsRejectModalOpen(false);
    setSelectedCaseForReject(null);
  };

  const handleRejectCase = (reviewCase: ReviewCase) => {
    setSelectedCaseForReject(reviewCase);
    setIsRejectModalOpen(true);
  };

  const handleLogout = () => {
    toast.info('已登出系統');
  };

  const handleSocialWorkerView = () => {
    setCurrentView('social-worker');
  };

  const handleEditRecord = (recordId: string) => {
    toast.info(`開啟編輯功能`, {
      description: `紀錄編號：${recordId}`
    });
  };

  const handleViewRecord = (recordId: string) => {
    // 模擬根據 recordId 找到對應的案件
    const mockRecordToCase: { [key: string]: ReviewCase } = {
      'R20240915001': {
        id: 'REV20240901001',
        caseNumber: 'B0500537',
        recordId: 'R20240915001',
        applicantName: '王小明',
        socialWorkerName: '陳社工',
        applicationDate: '2024-09-15',
        caseType: '急難救助金',
        amount: 'NT$ 15,000',
        status: 'rejected',
        reviewComments: '建議重新核對服務紀錄，確保資料正確性。個案經濟狀況評估需要提供更詳細的文件佐證，請補充家庭收支明細表。處遇計劃的時程安排請更具體明確，建議加入階段性目標設定。',
        reviewedAt: '2024-09-16 14:15'
      },
      'R20240914002': {
        id: 'REV20240901002',
        caseNumber: 'B0400448',
        recordId: 'R20240914002',
        applicantName: '李美華',
        socialWorkerName: '林社工',
        applicationDate: '2024-09-14',
        caseType: '教育助學金',
        amount: 'NT$ 8,000',
        status: 'rejected',
        reviewComments: '服務方案的執行期程與個案的學業安排有衝突，請與個案重新協調適合的時間安排。',
        reviewedAt: '2024-09-15 09:30'
      },
      'R20240913001': {
        id: 'REV20240901003',
        caseNumber: 'B0600515',
        recordId: 'R20240913001',
        applicantName: '陳志強',
        socialWorkerName: '張社工',
        applicationDate: '2024-09-13',
        caseType: '生活補助金',
        amount: 'NT$ 12,000',
        status: 'approved',
        reviewComments: '經審核個案資料完整，評估合理，服務計劃具體可行。同意核准生活補助金，建議持續追蹤家庭經濟狀況改善情形。',
        reviewedAt: '2024-09-14 10:30'
      },
      'R20240912001': {
        id: 'REV20240901006',
        caseNumber: 'B0450891',
        recordId: 'R20240912001',
        applicantName: '張淑芬',
        socialWorkerName: '王社工',
        applicationDate: '2024-09-12',
        caseType: '醫療補助金',
        amount: 'NT$ 25,000',
        status: 'approved',
        reviewComments: '心理諮商的安排很適切，請注意個案的情緒變化並及時調整服務方式。',
        reviewedAt: '2024-09-13 16:20'
      },
      'R20240911001': {
        id: 'REV20240901007',
        caseNumber: 'B0380624',
        recordId: 'R20240911001',
        applicantName: '劉建國',
        socialWorkerName: '李社工',
        applicationDate: '2024-09-11',
        caseType: '急難救助金',
        amount: 'NT$ 18,000',
        status: 'approved',
        reviewComments: '個案照顧責任重大，工作轉換期間確實需要支持。評估個案具備工作能力且積極求職，核准短期生活補助合理。建議同時連結就業服務資源，協助儘快找到穩定工作。',
        reviewedAt: '2024-09-12 11:15'
      }
    };

    const relatedCase = mockRecordToCase[recordId];
    if (relatedCase) {
      setSelectedCaseForView(relatedCase);
      setIsServiceRecordViewModalOpen(true);
    } else {
      toast.info(`查看紀錄詳情`, {
        description: `紀錄編號：${recordId}`
      });
    }
  };

  if (currentView === 'detailed-review') {
    return (
      <>
        <DetailedReviewPage
          serviceRecord={mockServiceRecord}
          onBack={() => setCurrentView('supervisor')}
          onApprove={handleDetailedApprove}
          onReject={handleDetailedReject}
          onSaveDraft={handleDetailedSaveDraft}
        />
        
        <RejectConfirmModal
          isOpen={isRejectModalOpen}
          onClose={() => setIsRejectModalOpen(false)}
          onConfirm={handleConfirmReject}
          caseName={selectedCaseForReject?.applicantName}
          caseId={selectedCaseForReject?.id}
        />
        
        <Toaster 
          position="top-right"
          richColors
          closeButton
        />
      </>
    );
  }

  if (currentView === 'social-worker') {
    return (
      <>
        <SocialWorkerDashboard
          socialWorkerName={socialWorkerName}
          onBack={() => setCurrentView('supervisor')}
          onEditRecord={handleEditRecord}
          onViewRecord={handleViewRecord}
        />

        {/* 服務紀錄純查看彈窗 - 社工員模式 */}
        <ServiceRecordViewModal
          isOpen={isServiceRecordViewModalOpen}
          onClose={() => {
            setIsServiceRecordViewModalOpen(false);
            setSelectedCaseForView(null);
          }}
          caseId={selectedCaseForView?.id || ''}
          caseName={selectedCaseForView?.applicantName || ''}
          caseNumber={selectedCaseForView?.caseNumber || ''}
          recordId={selectedCaseForView?.recordId || ''}
          status={selectedCaseForView?.status === 'approved' ? 'approved' : 'rejected'}
          reviewComments={
            selectedCaseForView?.status === 'rejected' 
              ? '建議重新核對服務紀錄，確保資料正確性。個案經濟狀況評估需要提供更詳細的文件佐證，請補充家庭收支明細表。處遇計劃的時程安排請更具體明確，建議加入階段性目標設定。'
              : selectedCaseForView?.reviewComments || ''
          }
          reviewedAt={selectedCaseForView?.reviewedAt || ''}
          reviewedBy="李督導"
          rejectionCategories={
            selectedCaseForView?.status === 'rejected' 
              ? ['data_error', 'need_supplementary'] 
              : undefined
          }
          onEditRecord={handleEditRecord}
        />
        
        <Toaster 
          position="top-right"
          richColors
          closeButton
        />
      </>
    );
  }



  return (
    <div className="min-h-screen bg-gray-50">
      <ReviewHeader 
        supervisorName={supervisorName}
        notificationCount={notificationCount}
        onLogout={handleLogout}
      />
      
      <main className="max-w-7xl mx-auto p-6">
        <ReviewTable
          cases={cases}
          onQuickReview={handleQuickReview}
          onDetailedReview={handleDetailedReview}
          onViewDetails={handleViewDetails}
          onViewDetailsReadOnly={handleViewDetailsReadOnly}
          onRejectCase={handleRejectCase}
        />
        
        {/* 開發測試按鈕 */}
        <div className="fixed bottom-4 right-4 space-y-2">
          <button
            onClick={handleSocialWorkerView}
            className="block w-full px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition-colors text-sm"
          >
            切換到社工員介面
          </button>
        </div>
      </main>

      {/* 退回確認彈窗 */}
      <RejectConfirmModal
        isOpen={isRejectModalOpen}
        onClose={() => {
          setIsRejectModalOpen(false);
          setSelectedCaseForReject(null);
        }}
        onConfirm={handleConfirmReject}
        caseName={selectedCaseForReject?.applicantName}
        caseId={selectedCaseForReject?.id}
      />

      {/* 服務紀錄詳情彈窗 */}
      <ServiceRecordDetailModal
        isOpen={isServiceRecordModalOpen}
        onClose={() => {
          setIsServiceRecordModalOpen(false);
          setSelectedCaseForDetail(null);
        }}
        caseId={selectedCaseForDetail?.id || ''}
        caseName={selectedCaseForDetail?.applicantName || ''}
        caseNumber={selectedCaseForDetail?.caseNumber || ''}
        recordId={selectedCaseForDetail?.recordId || ''}
        onQuickReview={handleQuickReview}
        onRejectCase={(caseId, notes) => {
          const reviewCase = cases.find(c => c.id === caseId);
          if (reviewCase) {
            handleRejectCase(reviewCase);
          }
        }}
        onSaveToQuickReview={(caseId, notes) => {
          // 觸發快審功能並預填審核建議
          // TODO: 未來實現預填功能
          toast.info('儲存為快速審核草稿', {
            description: `案件 ${caseId} 的審核建議已儲存`
          });
        }}
        onSaveToReject={(caseId, notes) => {
          // 觸發退回功能並預填退回原因
          // TODO: 未來實現預填功能
          toast.info('儲存為退回草稿', {
            description: `案件 ${caseId} 的退回原因已儲存`
          });
        }}
      />

      {/* 服務紀錄純查看彈窗 - 督導模式，不提供編輯功能 */}
      <ServiceRecordViewModal
        isOpen={isServiceRecordViewModalOpen}
        onClose={() => {
          setIsServiceRecordViewModalOpen(false);
          setSelectedCaseForView(null);
        }}
        caseId={selectedCaseForView?.id || ''}
        caseName={selectedCaseForView?.applicantName || ''}
        caseNumber={selectedCaseForView?.caseNumber || ''}
        recordId={selectedCaseForView?.recordId || ''}
        status={selectedCaseForView?.status === 'approved' ? 'approved' : 'rejected'}
        reviewComments={
          selectedCaseForView?.status === 'rejected' 
            ? '建議重新核對服務紀錄，確保資料正確性。個案經濟狀況評估需要提供更詳細的文件佐證，請補充家庭收支明細表。處遇計劃的時程安排請更具體明確，建議加入階段性目標設定。'
            : selectedCaseForView?.reviewComments || ''
        }
        reviewedAt={selectedCaseForView?.reviewedAt || ''}
        reviewedBy="李督導"
        rejectionCategories={
          selectedCaseForView?.status === 'rejected' 
            ? ['data_error', 'need_supplementary'] 
            : undefined
        }
        // 督導不提供編輯功能，不傳遞 onEditRecord
      />

      <Toaster 
        position="top-right"
        richColors
        closeButton
      />
    </div>
  );
}