import React from 'react';

type DashboardTab = 'blogs' | 'events' | 'users';

interface AdminSidebarProps {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  onLogout: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeTab, onTabChange, onLogout }) => {
  const tabs: { id: DashboardTab; label: string }[] = [
    { id: 'blogs', label: 'Blogs' },
    { id: 'events', label: 'Events' },
    { id: 'users', label: 'User' },
  ];

  return (
    <aside className="w-[220px] min-h-screen bg-navy flex flex-col">
      {/* Navigation */}
      <nav className="flex flex-col gap-3 p-6 pt-12">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              px-5 py-3 text-left text-base font-medium rounded-lg transition-all
              ${activeTab === tab.id 
                ? 'bg-green text-white' 
                : 'bg-muted/20 text-white/80 hover:bg-muted/30'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Logout */}
      <div className="p-6">
        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-5 py-3 w-full text-left text-white/90 bg-navy-dark/50 rounded-lg hover:bg-navy-dark transition-colors"
        >
          Log Out
          <span className="ml-auto">→</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
