import { NavLink } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <NavLink to="/" className="flex items-center gap-2 no-underline">
            <span className="text-xl font-bold text-blue-700 tracking-tight">FinPulse</span>
          </NavLink>
          <div className="flex items-center gap-6">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `text-sm font-medium transition-colors no-underline ${
                  isActive
                    ? 'text-blue-700 border-b-2 border-blue-700 pb-0.5'
                    : 'text-gray-600 hover:text-blue-700'
                }`
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/compare"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors no-underline ${
                  isActive
                    ? 'text-blue-700 border-b-2 border-blue-700 pb-0.5'
                    : 'text-gray-600 hover:text-blue-700'
                }`
              }
            >
              Compare
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
}
