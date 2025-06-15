import React, { useState, useEffect } from "react";
import {
  AppstoreOutlined,
  ExceptionOutlined,
  ApiOutlined,
  UserOutlined,
  BankOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  AliwangwangOutlined,
  BugOutlined,
  ScheduleOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { Layout, Menu, Dropdown, Space, message, Avatar, Button } from "antd";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { callLogout } from "config/api";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { isMobile } from "react-device-detect";
import type { MenuProps } from "antd";
import { setLogoutAction } from "@/redux/slice/accountSlide";
import { ALL_PERMISSIONS } from "@/config/permissions";

const { Content, Sider } = Layout;

const LayoutAdmin = () => {
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState("");
  const user = useAppSelector((state) => state.account.user);

  const permissions = useAppSelector(
    (state) => state.account.user.role.permissions
  );

  const roleName = useAppSelector((state) => state.account.user.role.name);
  const [menuItems, setMenuItems] = useState<MenuProps["items"]>([]);

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const ACL_ENABLE = import.meta.env.VITE_ACL_ENABLE;
    if (permissions?.length || ACL_ENABLE === "false") {
      const viewCompany = permissions?.find(
        (item) =>
          item.apiPath === ALL_PERMISSIONS.COMPANIES.GET_PAGINATE.apiPath &&
          item.method === ALL_PERMISSIONS.COMPANIES.GET_PAGINATE.method
      );

      const viewUser = permissions?.find(
        (item) =>
          item.apiPath === ALL_PERMISSIONS.USERS.GET_PAGINATE.apiPath &&
          item.method === ALL_PERMISSIONS.USERS.GET_PAGINATE.method
      );

      const viewJob = permissions?.find(
        (item) =>
          item.apiPath === ALL_PERMISSIONS.JOBS.GET_PAGINATE.apiPath &&
          item.method === ALL_PERMISSIONS.JOBS.GET_PAGINATE.method
      );

      const viewPost = permissions?.find(
        (item) =>
          item.apiPath === ALL_PERMISSIONS.POSTS.GET_PAGINATE.apiPath &&
          item.method === ALL_PERMISSIONS.POSTS.GET_PAGINATE.method
      );

      const viewResume = permissions?.find(
        (item) =>
          item.apiPath === ALL_PERMISSIONS.RESUMES.GET_PAGINATE.apiPath &&
          item.method === ALL_PERMISSIONS.RESUMES.GET_PAGINATE.method
      );

      const viewRole = permissions?.find(
        (item) =>
          item.apiPath === ALL_PERMISSIONS.ROLES.GET_PAGINATE.apiPath &&
          item.method === ALL_PERMISSIONS.ROLES.GET_PAGINATE.method
      );

      const viewPermission = permissions?.find(
        (item) =>
          item.apiPath === ALL_PERMISSIONS.PERMISSIONS.GET_PAGINATE.apiPath &&
          item.method === ALL_PERMISSIONS.USERS.GET_PAGINATE.method
      );

      const full = [
        ...(roleName === "SUPER_ADMIN" || ACL_ENABLE === "false"
          ? [
              {
                label: <Link to="/admin">Dashboard</Link>,
                key: "/admin",
                icon: <AppstoreOutlined />,
              },
            ]
          : []),
        ...(viewCompany || ACL_ENABLE === "false"
          ? [
              {
                label: <Link to="/admin/company">Công Ty</Link>,
                key: "/admin/company",
                icon: <BankOutlined />,
              },
            ]
          : []),

        ...(viewUser || ACL_ENABLE === "false"
          ? [
              {
                label: <Link to="/admin/user">Người Dùng</Link>,
                key: "/admin/user",
                icon: <UserOutlined />,
              },
            ]
          : []),
        ...(viewJob || ACL_ENABLE === "false"
          ? [
              {
                label: <Link to="/admin/job">Công việc</Link>,
                key: "/admin/job",
                icon: <ScheduleOutlined />,
              },
            ]
          : []),

        ...(viewPost || ACL_ENABLE === "false"
          ? [
              {
                label: <Link to="/admin/post">Bài đăng</Link>,
                key: "/admin/post",
                icon: <FileTextOutlined />,
              },
            ]
          : []),

        ...(viewResume || ACL_ENABLE === "false"
          ? [
              {
                label: <Link to="/admin/resume">Hồ sơ CV</Link>,
                key: "/admin/resume",
                icon: <AliwangwangOutlined />,
              },
            ]
          : []),
        ...(viewPermission || ACL_ENABLE === "false"
          ? [
              {
                label: <Link to="/admin/permission">Quyền</Link>,
                key: "/admin/permission",
                icon: <ApiOutlined />,
              },
            ]
          : []),
        ...(viewRole || ACL_ENABLE === "false"
          ? [
              {
                label: <Link to="/admin/role">Role</Link>,
                key: "/admin/role",
                icon: <ExceptionOutlined />,
              },
            ]
          : []),
      ];

      setMenuItems(full);
    }
  }, [permissions, roleName]);
  useEffect(() => {
    setActiveMenu(location.pathname);
  }, [location]);

  const handleLogout = async () => {
    const res = await callLogout();
    if (res && +res.statusCode === 200) {
      dispatch(setLogoutAction({}));
      message.success("Đăng xuất thành công");
      navigate("/");
    }
  };

  // if (isMobile) {
  //     items.push({
  //         label: <label
  //             style={{ cursor: 'pointer' }}
  //             onClick={() => handleLogout()}
  //         >Đăng xuất</label>,
  //         key: 'logout',
  //         icon: <LogoutOutlined />
  //     })
  // }

  const handleMenuClick = (e: { key: string }) => {
    if (e.key === "logout") {
      handleLogout();
    }
  };

  const itemsDropdown = [
    {
      label: <Link to={"/"}>Trang chủ</Link>,
      key: "home",
    },
    {
      label: <label style={{ cursor: "pointer" }}>Đăng xuất</label>,
      key: "logout",
    },
  ];

  return (
    <>
      <Layout style={{ minHeight: "100vh" }} className="layout-admin">
        {!isMobile ? (
          <Sider
            theme="light"
            collapsible
            collapsed={collapsed}
            onCollapse={(value) => setCollapsed(value)}
          >
            <div style={{ height: 32, margin: 16, textAlign: "center" }}>
              <BugOutlined /> ADMIN
            </div>
            <Menu
              selectedKeys={[activeMenu]}
              mode="inline"
              items={menuItems}
              onClick={(e) => setActiveMenu(e.key)}
            />
          </Sider>
        ) : (
          <Menu
            selectedKeys={[activeMenu]}
            items={menuItems}
            onClick={(e) => setActiveMenu(e.key)}
            mode="horizontal"
          />
        )}

        <Layout>
          {!isMobile && (
            <div
              className="admin-header"
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginRight: 20,
              }}
            >
              <Button
                type="text"
                icon={
                  collapsed
                    ? React.createElement(MenuUnfoldOutlined)
                    : React.createElement(MenuFoldOutlined)
                }
                onClick={() => setCollapsed(!collapsed)}
                style={{
                  fontSize: "16px",
                  width: 64,
                  height: 64,
                }}
              />

              <Dropdown
                menu={{ items: itemsDropdown, onClick: handleMenuClick }}
                trigger={["click"]}
              >
                <Space style={{ cursor: "pointer" }}>
                  Welcome {user?.name} - Số dư:{""}
                  {user?.balance?.toLocaleString("vi-VN")} VNĐ
                  <Avatar>
                    {" "}
                    {user?.name?.substring(0, 2)?.toUpperCase()}{" "}
                  </Avatar>
                </Space>
              </Dropdown>
            </div>
          )}
          <Content style={{ padding: "15px" }}>
            <Outlet />
          </Content>
          {/* <Footer style={{ padding: 10, textAlign: 'center' }}>
                        React Typescript series Nest.JS &copy; Tuan Kiet - Made with <HeartTwoTone />
                    </Footer> */}
        </Layout>
      </Layout>
    </>
  );
};

export default LayoutAdmin;
