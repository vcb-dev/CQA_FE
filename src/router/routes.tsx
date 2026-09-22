import { lazy, Suspense, type ReactNode } from "react";
import PageLoader from "@/components/PageLoader";

const DashboardPage = lazy(() => import("@/pages/Dashboard/DashboardPage"));
const ConversationsPage = lazy(() => import("@/pages/Conversations/ConversationsPage"));
const PancakeTestPage = lazy(() => import("@/pages/PancakeTest/PancakeTestPage"));
const AIInsightPage = lazy(() => import("@/pages/AIInsight/AIInsightPage"));
const QualityPage = lazy(() => import("@/pages/Quality/QualityPage"));
const EmployeesPage = lazy(() => import("@/pages/Employees/EmployeesPage"));
const CustomersPage = lazy(() => import("@/pages/Customers/CustomersPage"));
const PagesPage = lazy(() => import("@/pages/Pages/PagesPage"));
const AdsPage = lazy(() => import("@/pages/Ads/AdsPage"));
const ProductsPage = lazy(() => import("@/pages/Products/ProductsPage"));
const SettingsPage = lazy(() => import("@/pages/Settings/SettingsPage"));
const InstagramCommentsPage = lazy(
  () => import("@/pages/InstagramComments/InstagramCommentsPage"),
);

function lazyPage(element: ReactNode, label?: string) {
  return <Suspense fallback={<PageLoader label={label} />}>{element}</Suspense>;
}

export const routes = [
  { path: "/", element: lazyPage(<DashboardPage />, "Đang tải tổng quan...") },
  { path: "/conversations", element: lazyPage(<ConversationsPage />) },
  { path: "/pancake-test", element: lazyPage(<PancakeTestPage />) },
  { path: "/ai-insight", element: lazyPage(<AIInsightPage />) },
  { path: "/quality", element: lazyPage(<QualityPage />) },
  {
    path: "/instagram-comments",
    element: lazyPage(<InstagramCommentsPage />, "Đang tải bình luận IG..."),
  },
  { path: "/employees", element: lazyPage(<EmployeesPage />) },
  { path: "/customers", element: lazyPage(<CustomersPage />) },
  { path: "/pages", element: lazyPage(<PagesPage />) },
  { path: "/ads", element: lazyPage(<AdsPage />) },
  { path: "/products", element: lazyPage(<ProductsPage />) },
  { path: "/settings", element: lazyPage(<SettingsPage />) },
];
