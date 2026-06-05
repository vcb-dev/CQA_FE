import DashboardPage from "@/pages/Dashboard/DashboardPage";
import ConversationsPage from "@/pages/Conversations/ConversationsPage";
import AIInsightPage from "@/pages/AIInsight/AIInsightPage";
import QualityPage from "@/pages/Quality/QualityPage";
import EmployeesPage from "@/pages/Employees/EmployeesPage";
import CustomersPage from "@/pages/Customers/CustomersPage";
import PagesPage from "@/pages/Pages/PagesPage";
import AdsPage from "@/pages/Ads/AdsPage";
import ProductsPage from "@/pages/Products/ProductsPage";
import RevenuePage from "@/pages/Revenue/RevenuePage";
import ReportsPage from "@/pages/Reports/ReportsPage";
import WarrantyPage from "@/pages/Warranty/WarrantyPage";
import SettingsPage from "@/pages/Settings/SettingsPage";

export const routes = [
  { path: "/", element: <DashboardPage /> },
  { path: "/conversations", element: <ConversationsPage /> },
  { path: "/ai-insight", element: <AIInsightPage /> },
  { path: "/quality", element: <QualityPage /> },
  { path: "/employees", element: <EmployeesPage /> },
  { path: "/customers", element: <CustomersPage /> },
  { path: "/pages", element: <PagesPage /> },
  { path: "/ads", element: <AdsPage /> },
  { path: "/products", element: <ProductsPage /> },
  { path: "/revenue", element: <RevenuePage /> },
  { path: "/reports", element: <ReportsPage /> },
  { path: "/warranty", element: <WarrantyPage /> },
  { path: "/settings", element: <SettingsPage /> },
];
