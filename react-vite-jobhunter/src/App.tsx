import { useEffect, useRef, useState } from "react";
import {
  createBrowserRouter,
  Outlet,
  RouterProvider,
  useLocation,
  Navigate,
} from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import NotFound from "components/share/not.found";
import Loading from "components/share/loading";
import LoginPage from "pages/auth/login";
import RegisterPage from "pages/auth/register";
import LayoutAdmin from "components/admin/layout.admin";
import ProtectedRoute from "components/share/protected-route.ts";
import Header from "components/client/header.client";
import Footer from "components/client/footer.client";
import HomePage from "pages/home";
import styles from "styles/app.module.scss";
import DashboardPage from "./pages/admin/dashboard";
import CompanyPage from "./pages/admin/company";
import PermissionPage from "./pages/admin/permission";
import ResumePage from "./pages/admin/resume";
import RolePage from "./pages/admin/role";
import UserPage from "./pages/admin/user";
import { fetchAccount } from "./redux/slice/accountSlide";
import LayoutApp from "./components/share/layout.app";
import ViewUpsertJob from "./components/admin/job/upsert.job";
import ClientCompanyPage from "./pages/company";
import ClientCompanyDetailPage from "./pages/company/detail";
import JobTabs from "./pages/admin/job/job.tabs";
import PostPage from "./pages/admin/post";
import ViewUpsertPost from "./components/admin/post/upsert.post";
import ClientPostPage from "./pages/post";
import ClientPostDetailPage from "./pages/post/detail";
import { message } from "antd";
import ClientJobPage from "./pages/job";

const LayoutClient = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const location = useLocation();
  const rootRef = useRef<HTMLDivElement>(null);
  const notificationShownRef = useRef(false);

  useEffect(() => {
    if (rootRef && rootRef.current) {
      rootRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [location]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const paymentStatus = searchParams.get("payment");

    if (paymentStatus && !notificationShownRef.current) {
      if (paymentStatus === "success") {
        message.success(
          "Thanh toán thành công! Số dư của bạn đã được cập nhật."
        );
      } else if (paymentStatus === "failed") {
        message.error("Thanh toán thất bại. Vui lòng thử lại sau.");
      }
      notificationShownRef.current = true;
    }
  }, [location]);

  return (
    <div className="layout-app" ref={rootRef}>
      <Header searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <div className={styles["content-app"]}>
        <Outlet context={[searchTerm, setSearchTerm]} />
      </div>
      <Footer />
    </div>
  );
};

const AdminRoute = () => {
  const user = useAppSelector((state) => state.account.user);

  if (user?.role?.name === "SUPER_ADMIN") {
    return <DashboardPage />;
  }

  return <Navigate to="/admin/job" replace />;
};

export default function App() {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector((state) => state.account.isLoading);

  useEffect(() => {
    if (
      window.location.pathname === "/login" ||
      window.location.pathname === "/register"
    )
      return;
    dispatch(fetchAccount());
  }, []);

  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <LayoutApp>
          <LayoutClient />
        </LayoutApp>
      ),
      errorElement: <NotFound />,
      children: [
        { index: true, element: <HomePage /> },
        { path: "post", element: <ClientPostPage /> },
        { path: "job", element: <ClientJobPage /> },
        { path: "post/:id", element: <ClientPostDetailPage /> },
        { path: "company", element: <ClientCompanyPage /> },
        { path: "company/:id", element: <ClientCompanyDetailPage /> },
      ],
    },

    {
      path: "/admin",
      element: (
        <LayoutApp>
          <LayoutAdmin />{" "}
        </LayoutApp>
      ),
      errorElement: <NotFound />,
      children: [
        {
          index: true,
          element: (
            <ProtectedRoute>
              <AdminRoute />
            </ProtectedRoute>
          ),
        },
        {
          path: "company",
          element: (
            <ProtectedRoute>
              <CompanyPage />
            </ProtectedRoute>
          ),
        },
        {
          path: "user",
          element: (
            <ProtectedRoute>
              <UserPage />
            </ProtectedRoute>
          ),
        },

        {
          path: "job",
          children: [
            {
              index: true,
              element: (
                <ProtectedRoute>
                  <JobTabs />
                </ProtectedRoute>
              ),
            },
            {
              path: "upsert",
              element: (
                <ProtectedRoute>
                  <ViewUpsertJob />
                </ProtectedRoute>
              ),
            },
          ],
        },

        {
          path: "post",
          children: [
            {
              index: true,
              element: (
                <ProtectedRoute>
                  <PostPage />
                </ProtectedRoute>
              ),
            },
            {
              path: "upsert",
              element: (
                <ProtectedRoute>
                  <ViewUpsertPost />
                </ProtectedRoute>
              ),
            },
          ],
        },

        {
          path: "resume",
          element: (
            <ProtectedRoute>
              <ResumePage />
            </ProtectedRoute>
          ),
        },
        {
          path: "permission",
          element: (
            <ProtectedRoute>
              <PermissionPage />
            </ProtectedRoute>
          ),
        },
        {
          path: "role",
          element: (
            <ProtectedRoute>
              <RolePage />
            </ProtectedRoute>
          ),
        },
      ],
    },

    {
      path: "/login",
      element: <LoginPage />,
    },

    {
      path: "/register",
      element: <RegisterPage />,
    },
  ]);

  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}
