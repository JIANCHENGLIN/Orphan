import { Badge } from "./ui/badge";

export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'processing';

interface ReviewStatusBadgeProps {
  status: ReviewStatus;
  className?: string;
}

const statusConfig = {
  pending: {
    label: '待審核',
    className: 'review-status-pending',
    icon: '🔴'
  },
  approved: {
    label: '已核准',
    className: 'review-status-approved',
    icon: '🟢'
  },
  rejected: {
    label: '已退回',
    className: 'review-status-rejected',
    icon: '🟠'
  },
  processing: {
    label: '審核中',
    className: 'review-status-processing',
    icon: '🔵'
  }
};

export function ReviewStatusBadge({ status, className }: ReviewStatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <Badge 
      className={`${config.className} ${className} rounded px-2 py-1 text-xs font-medium flex items-center gap-1`}
    >
      <span>{config.icon}</span>
      {config.label}
    </Badge>
  );
}