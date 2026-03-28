import { TbLayoutDashboardFilled } from "react-icons/tb";
import { RxUpdate } from "react-icons/rx";
import { TbReportSearch } from "react-icons/tb";
import { MdNotificationsActive } from "react-icons/md";
import { Link } from "react-router-dom";

const Navbar = () => {

    //settingup the NavItems
    const NavItems = [
        {label: "Products", path: '/products',  icon: <TbLayoutDashboardFilled />},
        {label: "UpdateProducts", path: '/updateproducts', icon: <RxUpdate />},
        {label: "Report", path: '/reports', icon: <TbReportSearch />},
        {label: "Notification", path: '/notification', icon: <MdNotificationsActive />},
       
]


  return (
    <aside className="w-64 min-h-screen bg-gray-800">
        <div className="p-6">
            <h1 className="text-orange-400 font-bold italic text-xl">RetailPro <span className="text-white">Management System</span></h1>
        </div>
        
        <nav className="mt-6">
            <ul className="space-y-2 px-4">
                {NavItems.map((item) => (
                    <li key={item.path}>
                        <Link 
                            to={item.path} 
                            className="flex items-center gap-3 p-3 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors duration-200"
                        >
                            <div className="text-xl">
                                {item.icon}
                            </div>
                            <span className="font-medium">
                                {item.label}
                            </span>
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    </aside>
  );
}

export default Navbar