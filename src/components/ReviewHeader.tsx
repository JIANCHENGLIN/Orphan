import { Bell, Settings, User, ChevronDown } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface ReviewHeaderProps {
  supervisorName: string;
  notificationCount: number;
  onLogout: () => void;
}

export function ReviewHeader({ supervisorName, notificationCount, onLogout }: ReviewHeaderProps) {
  return (
    null
  );
}