import {
  LayoutDashboard,
  FileCode2,
  Users,
  Settings,
  LogOut,
  PlusCircle
} from "lucide-react";
import Link from "next/link";

export default function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-[calc(100vh-60px)] bg-[#f4f7f9] text-[#333]">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between shadow-sm">
        <div>
          <div className="p-6 border-b border-gray-50 flex items-center space-x-3">
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center font-bold text-white shadow-md">
              A
            </div>
            <span className="font-bold text-gray-800 tracking-tight">Assessly Panel</span>
          </div>

          <nav className="mt-6 px-3 space-y-1">
            <Link
              href="/instructor"
              className="flex items-center px-4 py-3 text-sm font-semibold rounded-lg hover:bg-blue-50 hover:text-primary transition-all group bg-blue-50 text-primary"
            >
              <LayoutDashboard className="w-5 h-5 mr-3" />
              Dashboard
            </Link>
            <Link
              href="/instructor/create"
              className="flex items-center px-4 py-3 text-sm font-medium rounded-lg hover:bg-gray-50 hover:text-primary transition-all group text-gray-600"
            >
              <PlusCircle className="w-5 h-5 mr-3" />
              Create Assignment
            </Link>
            <Link
              href="/instructor/assignments"
              className="flex items-center px-4 py-3 text-sm font-medium rounded-lg hover:bg-gray-50 hover:text-primary transition-all group text-gray-600"
            >
              <FileCode2 className="w-5 h-5 mr-3" />
              Assignments
            </Link>
            <Link
              href="/instructor/students"
              className="flex items-center px-4 py-3 text-sm font-medium rounded-lg hover:bg-gray-50 hover:text-primary transition-all group text-gray-600"
            >
              <Users className="w-5 h-5 mr-3" />
              Students
            </Link>
          </nav>
        </div>

        <div className="p-4 mb-4 border-t border-gray-100 italic text-[10px] text-gray-400 text-center">
            Yasar University • Assessly Evaluation System
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-[#f4f7f9] p-8">
        {children}
      </div>
    </div>
  );
}
