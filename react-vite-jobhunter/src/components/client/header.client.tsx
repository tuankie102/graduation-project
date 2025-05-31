import { useState, useEffect } from "react";
import {
  CodeOutlined,
  ContactsOutlined,
  FireOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  RiseOutlined,
  TwitterOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import { Avatar, Drawer, Dropdown, MenuProps, Space, message } from "antd";
import { Menu, ConfigProvider } from "antd";
import styles from "@/styles/client.module.scss";
import { isMobile } from "react-device-detect";
import { FaReact } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { callLogout } from "@/config/api";
import { setLogoutAction } from "@/redux/slice/accountSlide";
import ManageAccount from "./modal/manage.account";
import DepositMoney from "./modal/deposit.money";

const Header = (props: any) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const isAuthenticated = useAppSelector(
    (state) => state.account.isAuthenticated
  );
  const user = useAppSelector((state) => state.account.user);
  const [openMobileMenu, setOpenMobileMenu] = useState<boolean>(false);

  const [current, setCurrent] = useState("home");
  const location = useLocation();

  const [openMangeAccount, setOpenManageAccount] = useState<boolean>(false);
  const [openDepositMoney, setOpenDepositMoney] = useState<boolean>(false);

  useEffect(() => {
    setCurrent(location.pathname);
  }, [location]);

  const items: MenuProps["items"] = [
    {
      label: <Link to={"/"}>Trang Chủ</Link>,
      key: "/",
      icon: <TwitterOutlined />,
    },
    {
      label: <Link to={"/post"}>Bài đăng tuyển dụng</Link>,
      key: "/post",
      icon: <CodeOutlined />,
    },
    {
      label: <Link to={"/company"}>Top Công ty IT</Link>,
      key: "/company",
      icon: <RiseOutlined />,
    },
  ];

  const onClick: MenuProps["onClick"] = (e) => {
    setCurrent(e.key);
  };

  const handleLogout = async () => {
    const res = await callLogout();
    if (res && +res.statusCode === 200) {
      dispatch(setLogoutAction({}));
      message.success("Đăng xuất thành công");
      navigate("/");
    }
  };

  const handleMenuClick = (e: { key: string }) => {
    if (e.key === "manage-account") {
      setOpenManageAccount(true);
    } else if (e.key === "deposit") {
      setOpenDepositMoney(true);
    } else if (e.key === "logout") {
      handleLogout();
    }
  };

  const itemsDropdown = [
    {
      label: "Quản lý tài khoản",
      key: "manage-account",
      icon: <ContactsOutlined />,
    },
    {
      label: "Nạp tiền",
      key: "deposit",
      icon: <WalletOutlined />,
    },
    ...(user.role?.permissions?.length
      ? [
          {
            label: <Link to={"/admin"}>Trang Quản Trị</Link>,
            key: "admin",
            icon: <FireOutlined />,
          },
        ]
      : []),
    {
      label: "Đăng xuất",
      key: "logout",
      icon: <LogoutOutlined />,
    },
  ];

  const itemsMobiles = [...items, ...itemsDropdown];

  return (
    <>
      <div className={styles["header-section"]}>
        <div className={styles["container"]}>
          {!isMobile ? (
            <div style={{ display: "flex", gap: 30 }}>
              <div className={styles["brand"]}>
                <FaReact onClick={() => navigate("/")} title="Tuan Kiet" />
              </div>
              <div className={styles["top-menu"]}>
                <ConfigProvider
                  theme={{
                    token: {
                      colorPrimary: "#fff",
                      colorBgContainer: "#222831",
                      colorText: "#a7a7a7",
                    },
                  }}
                >
                  <Menu
                    selectedKeys={[current]}
                    mode="horizontal"
                    items={items}
                  />
                </ConfigProvider>
                <div className={styles["extra"]}>
                  {isAuthenticated === false ? (
                    <Link to={"/login"}>Đăng Nhập</Link>
                  ) : (
                    <Dropdown
                      menu={{ items: itemsDropdown, onClick: handleMenuClick }}
                      trigger={["click"]}
                    >
                      <Space style={{ cursor: "pointer" }}>
                        <span>
                          Welcome {user?.name} - Số dư:{" "}
                          {user?.balance?.toLocaleString("vi-VN")} VNĐ
                        </span>
                        <Avatar>
                          {user?.name?.substring(0, 2)?.toUpperCase()}
                        </Avatar>
                      </Space>
                    </Dropdown>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className={styles["header-mobile"]}>
              <span>Your APP</span>
              <MenuFoldOutlined onClick={() => setOpenMobileMenu(true)} />
            </div>
          )}
        </div>
      </div>
      <Drawer
        title="Chức năng"
        placement="right"
        onClose={() => setOpenMobileMenu(false)}
        open={openMobileMenu}
      >
        <Menu
          onClick={handleMenuClick}
          selectedKeys={[current]}
          mode="vertical"
          items={itemsMobiles}
        />
      </Drawer>
      <ManageAccount open={openMangeAccount} onClose={setOpenManageAccount} />
      <DepositMoney open={openDepositMoney} onClose={setOpenDepositMoney} />
    </>
  );
};

export default Header;
